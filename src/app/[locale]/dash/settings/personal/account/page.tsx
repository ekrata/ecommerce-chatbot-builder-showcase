import ct from 'countries-and-timezones';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { BsPerson } from 'react-icons/bs';
import { toast } from 'react-toastify';
import * as z from 'zod';

import { languageCodeMap } from '@/app/[locale]/(helpers)/lang';
import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useUpdateOperatorMut } from '@/app/[locale]/(hooks)/mutations/useUpdateOperatorMut';
import { UpdateOperator } from '@/entities/entities';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email().min(1, { message: 'Required' }),
  name: z.string().min(1, { message: 'Required' }),
  profilePicture: z.string().url(),
  region: z.string().min(1, { message: 'Required' }),
  language: z.string().min(1, { message: 'Required' })
})


export default function Page() {
  const tDash = useTranslations('dash')
  const t = useTranslations('dash.settings.Account')
  const [user] = useAuthContext()
  const orgId = user?.orgId ?? ''
  const operatorId = user?.operatorId ?? ''
  const updateOperatorMut = useUpdateOperatorMut(orgId, operatorId)

  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm({ defaultValues: { ...user }, resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async (data) => {
    const updateBody: UpdateOperator = {
      ...data
    }
    const res = await updateOperatorMut.mutateAsync([orgId, operatorId, updateBody])
    if (updateOperatorMut.isSuccess) {
      toast.success('Updated your account!')
    }
    else if (updateOperatorMut.isError) {
      toast.success(`Failed to update your account: ${updateOperatorMut.error}`)
    }
  })
  return (
    <form className='h-screen px-2 bg-white' onSubmit={onSubmit} >
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
          <input className='input input-sm input-bordered'></input>
        </div>
        <div className='col-span-3 place-items-center'>
          {t('Your picture')}
        </div>
        <div className='flex col-span-9 place-items-center gap-x-2'>
          <div className="avatar">
            <div className="w-10 mask mask-squircle">
              {user?.profilePicture ?
                <img src={user.profilePicture}></img>
                :
                <BsPerson></BsPerson>
              }
            </div>
          </div>
          <input type="file" className="w-full max-w-xs file-input file-input-bordered file-input-sm file-input-primary " />
        </div>
        <div className='col-span-3'>
          {tDash('Email')}
        </div>
        <div className='col-span-9'>
          <input className='input input-sm input-bordered'></input>
        </div>
        <div className='col-span-3'>
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
          <select className="max-w-xs select select-bordered select-sm" {...register("region", { required: true })}>
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