'use client'
import ct from 'countries-and-timezones';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BsPerson } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { QueryKey } from 'widget/src/app/(actions)/queries';
import * as z from 'zod';

import { UpdateOperator } from '@/entities/entities';
import { languageCodeMap } from '@/src/app/[locale]/(helpers)/lang';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import { useUpdateOperatorMut } from '@/src/app/[locale]/(hooks)/mutations/useUpdateOperatorMut';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const schema = z.object({
  email: z.string().email().min(1, { message: 'Required' }),
  name: z.string().min(1, { message: 'Required' }),
  profilePicture: z.any()
    .refine((files) => {
      console.log(files?.[0].size, MAX_FILE_SIZE)
      return files?.length === 0, "Image is required."
    }) // if no file files?.length === 0, if file files?.length === 1
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`) // this should be greater than or equals (>=) not less that or equals (<=)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  region: z.string()?.optional(),
  language: z.string()?.optional()
})

export type FormValues = z.infer<typeof schema>

const getPresignedUploadUrl = async (operatorId: string, orgId: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/operators/${operatorId}/getPresignedProfileUrl`)
    return await res?.json()
  }
  catch (err) {
    console.log(err)
  }
}


export default function Page() {
  const tDash = useTranslations('dash')
  const t = useTranslations('dash.settings.Account')
  const [user, _, refreshSession] = useAuthContext()
  const orgId = user?.orgId ?? ''
  const operatorId = user?.operatorId ?? ''
  const updateOperatorMut = useUpdateOperatorMut(orgId, operatorId)
  const [image, setImage] = useState<File | null>(null)
  const presignedUploadUrlQuery = useQuery([QueryKey?.operatorPictureUploadUrl, orgId, operatorId], async () => await getPresignedUploadUrl(operatorId, orgId));
  const presignedUploadUrlMut = useMutation([QueryKey?.operatorPictureUploadUrl, orgId, operatorId], async (file: File | null | undefined) => {
    if (file) {
      try {
        const res = await fetch(presignedUploadUrlQuery?.data?.url, {
          body: file,
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${file.name}"`,
          }
        });
        return res?.url
      }
      catch (err) {
        return err
      }
    }
    return ''
  }

  );

  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm<FormValues>({ defaultValues: { ...user }, resolver: zodResolver(schema) });

  useEffect(() => {
    // setValue('profilePicture', user?.profilePicture)
    if (user?.profilePicture) {
      // console.log(user?.profilePicture)
      setImage(user?.profilePicture);
    }
  }, [user])
  const onSubmit = handleSubmit(async (data) => {
    const imageRes = await presignedUploadUrlMut.mutateAsync(data?.profilePicture?.item(0))
    console.log(imageRes)
    const body: UpdateOperator = {
      ...data,
      profilePicture: imageRes?.split('?')?.[0] as string,
    }


    const res = await updateOperatorMut.mutateAsync([orgId, operatorId, body])

    if (updateOperatorMut.isSuccess) {
      toast.success('Updated your account!')
    }
    else if (updateOperatorMut.isError) {
      toast.success(`Failed to update your account: ${updateOperatorMut.error}`)
    }
  })

  const onImageChange = (files: FileList) => {
    setImage(files?.item(0))
  }

  return (
    <form className='h-screen px-2 bg-white' onSubmit={onSubmit} >
      <button className='fixed normal-case right-1 top-2 btn-sm btn btn-primary btn-outline gap-x-2 ' type='submit'>
        <FaSave />
        {tDash('Save')}
      </button>
      <div className='w-full border-b-[1px] mb-5 text-3xl '>
        <h3>
          {t('Personal Details')}
        </h3>
      </div>
      < div className="grid grid-cols-12 gap-y-4 " >
        <div className='col-span-3'>
          {t('Name')}
        </div>
        <div className='col-span-9'>
          <input className='input input-sm input-bordered' {...register('name')} ></input>
        </div>
        <div className='col-span-3 place-items-center'>
          {t('Your picture')}
        </div>
        <div className='flex col-span-9 place-items-center gap-x-2'>
          <div className="avatar">
            <div className="w-10 mask mask-squircle">
              {user?.profilePicture ?
                <img id='preview' src={user?.profilePicture}></img>
                :
                <BsPerson></BsPerson>
              }
            </div>
          </div>
          <input id="image-input" type="file" className="w-full max-w-xs file-input file-input-bordered file-input-sm file-input-primary " accept="image/png, image/jpeg" {...register('profilePicture')} onChange={(event) => {
            if (event?.target?.files) {
              onImageChange(event?.target?.files)
            }
          }} />
          {errors?.profilePicture && <p className='justify-start text-xs text-error'>{errors?.profilePicture?.message?.toString()}</p>}
        </div>
        {/* <div className='col-span-3'>
          {tDash('Email')}
        </div>
        <div className='col-span-9'>
          <input className='input input-sm input-bordered'></input>
        </div> */}
        <div className='col-span-3' >
          {t('Region')}
        </div>
        <div className='col-span-9'>
          <select className="max-w-xs select select-bordered select-sm" {...register("region", { required: true })}>
            {Object.entries(ct.getAllTimezones()).map(([key, value]) => (
              <option>{key}</option>
            ))}
          </select>
        </div>
        <div className='col-span-3'>
          {t('Language')}
        </div>
        <div className='col-span-9'>
          <select className="max-w-xs select select-bordered select-sm" {...register("language", { required: true })}>
            {languageCodeMap.map((item) => {
              const [[key, value]] = Object.entries(item)
              return (< option value={key}> {value}</option>)
            })}
          </select>
        </div>
      </div >
    </form >
  )
}