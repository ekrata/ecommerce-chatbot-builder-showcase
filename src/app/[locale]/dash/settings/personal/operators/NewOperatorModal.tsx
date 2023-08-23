import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { BiShieldQuarter, BiSolidCrown } from 'react-icons/bi';
import { BsPersonFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useOnClickOutside } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import * as zod from 'zod';

import { useOperatorSession } from '@/app/[locale]/(helpers)/useOperatorSession';
import { useCreateOperatorMut } from '@/app/[locale]/(hooks)/mutations/useCreateOperatorMut';
import { CreateOperator, UpdateOperator } from '@/entities/entities';
import { Operator, permissionTier } from '@/entities/operator';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = zod.object({
  name: zod.string(),
  email: zod.string(),
  permissionTier: zod.enum(permissionTier)
})

export const getOperatorIcon = (operator: EntityItem<typeof Operator>) => {
  switch (operator.permissionTier) {
    case 'admin': {
      return <BiSolidCrown />
    }
    case 'moderator': {
      return <BiShieldQuarter />
    }
    case 'operator': {
      return <BsPersonFill />
    }
  }
}

export const NewOperatorModal: FC = () => {
  const t = useTranslations('dash.settings.Operators')
  const tDash = useTranslations('dash')
  const { orgId } = useOperatorSession()
  const dialogRef = useRef(null);
  const { register, handleSubmit, getValues, formState: { errors }
  } = useForm<zod.infer<typeof schema>>({ defaultValues: {}, resolver: zodResolver(schema), });
  const newOperatorId = uuidv4()

  const createOperatorMut = useCreateOperatorMut(orgId, newOperatorId)

  useOnClickOutside(dialogRef, () => {
    window?.new_operator_modal?.close()
  })

  // const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm({ defaultValues: { name: operator.name, email: operator.email }, resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async (data) => {
    console.log('hi')
    console.log(data)
    const createBody: CreateOperator = {
      orgId,
      operatorId: newOperatorId,
      ...data
    }
    await createOperatorMut.mutateAsync([orgId, newOperatorId, createBody])
    if (createOperatorMut.isSuccess) {
      toast.success('Updated your account!')
    }
    else if (createOperatorMut.isError) {
      toast.success(`Failed to update your account: ${createOperatorMut.error}`)
    }
  })

  return (
    <>
      <button type='button' className="normal-case btn btn-sm btn-primary" onClick={() => window?.new_operator_modal?.showModal()}>{t('Add an operator')}</button >
      <dialog id="new_operator_modal" className="bg-transparent">
        <form method="dialog" className="flex flex-col gap-y-4 modal-box w-[30rem] place-items-center" ref={dialogRef} onSubmit={onSubmit}>
          <button type='button' className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2" onClick={() => window.new_operator_modal.close()}>✕</button>
          <div className="w-full mb-4 text-center ">
            <h3 className='text-3xl'>
              {t('Add an operator')}
            </h3>
          </div>
          <div className="w-3/4 form-control">
            <label className="label">
              <span className="font-semibold label-text">{tDash('Name')}</span>
            </label>
            <input placeholder={tDash('Name')} className={`w-full input input-bordered btn-sm`} {...register('name', { required: true })} />
            {errors?.name && <label className='text-error'>{errors.name.message}</label>}
          </div>
          <div className='w-3/4 gap-x-1 form-control'>
            <label className="label">
              <span className="font-semibold label-text">{tDash('Email')}</span>
            </label>
            <>
              <input type='email' placeholder={'email'} className={`w-full input input-bordered btn-sm`} {...register('email', { required: true })} />
              {errors?.email && <label className='text-error'>{errors.email.message}</label>}
            </>
          </div>
          <div className='w-3/4 gap-x-1 form-control'>
            <label className="label">
              <span className="font-semibold label-text">{t('Role')}</span>
            </label>
            <>
              {errors?.permissionTier && <label className='text-error'>{errors.permissionTier.message}</label>}
              <select className="max-w-xs select select-bordered select-sm" {...register('permissionTier', { required: true })}>
                {permissionTier.map((tier) =>
                  tier !== 'owner' && <option value={tier}>{tier}</option>
                )}
              </select>
            </>
          </div>
          <div className='flex'>
            <button type='submit' className="normal-case btn btn-sm btn-primary" >{tDash('Create')}</button >
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog >
    </>
  )
}