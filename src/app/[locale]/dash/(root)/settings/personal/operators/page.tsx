'use client';

import ct from 'countries-and-timezones';
import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { BiShieldQuarter, BiSolidCrown } from 'react-icons/bi';
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import { useCreateOperatorMut } from '@/app/[locale]/(hooks)/mutations/useCreateOperatorMut';
import { useDeleteOperatorMut } from '@/app/[locale]/(hooks)/mutations/useDeleteOperatorMut';
import { useConfigurationQuery } from '@/app/[locale]/(hooks)/queries';
import { useOperatorsQuery } from '@/app/[locale]/(hooks)/queries/useOperatorsQuery';

import { getOperatorIcon, NewOperatorModal } from './NewOperatorModal';

export default function Page() {
  const tDash = useTranslations('dash')
  const t = useTranslations('dash.settings.Operators')
  const [operator] = useAuthContext()
  const orgId = operator?.orgId ?? ''
  const newOperatorId = uuidv4()
  const configurationQuery = useConfigurationQuery(orgId);
  const operatorsQuery = useOperatorsQuery(orgId);
  const createOperatorMut = useCreateOperatorMut(orgId, newOperatorId)
  const deleteOperatorMut = useDeleteOperatorMut(orgId, newOperatorId)
  const timezones = ct.getAllTimezones();

  // const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm({ defaultValues: { ...operator }, resolver: zodResolver(schema) });


  return (
    <form className='h-screen px-2 bg-white ' >
      <div className='w-full border-b-[1px] mb-5 pt-2 text-3xl flex justify-between'>
        <h3>
          {t('Operators')}
        </h3>
        <NewOperatorModal></NewOperatorModal>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th></th>
              <th>{tDash('Name')}</th>
              <th>{tDash('Email')}</th>
              <th>{t('Role')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {operatorsQuery?.data?.map((operator) => {
              return (
                <tr>
                  <th></th>
                  <td>{operator.name}</td>
                  <td>
                    {operator.email}
                  </td>
                  <td className=''>
                    <p className='flex place-items-center gap-x-2'>
                      {getOperatorIcon(operator)}
                      {operator.permissionTier}
                    </p>
                  </td>
                  {operator.permissionTier !== 'admin'}
                  <td className='flex justify-end gap-x-2'>
                    <button type='button' className='normal-case btn btn-sm btn-outline' onClick={() => { }}>{t('Resend invitation')}</button>
                    <button type='button' className='normal-case btn btn-sm btn-outline' onClick={async () => await deleteOperatorMut.mutateAsync([orgId, operator.operatorId])}>{tDash('Remove')}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </form >
  )
}