'use client'
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { BsLink, BsX } from 'react-icons/bs';

import { ConfigTicketing } from '@/entities/configuration';
import { Collapse } from '@/src/app/[locale]/(components)/Collapse';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import {
  useUpdateConfigurationMut
} from '@/src/app/[locale]/(hooks)/mutations/useUpdateConfigurationMut';
import { useConfigurationQuery } from '@/src/app/[locale]/(hooks)/queries/useConfigurationQuery';

import { EmailModal } from './EmailModal';

const resolver: Resolver<ConfigTicketing> = async (values) => {
  return {
    values,
    errors: Object.keys(values).reduce((prev, curr) => {
      if (!values?.[curr as keyof typeof values]) {
        return {
          ...prev,
          [curr]: {
            type: 'required',
            message: 'This is required.',
          },
        }
      }
      return prev
    }, {})
  };
};

export default function Page() {
  const t = useTranslations('dash.settings.Ticketing')
  const tDash = useTranslations('dash')
  const [user] = useAuthContext();
  const orgId = user?.orgId ?? ''
  const configurationQuery = useConfigurationQuery(orgId);
  const updateConfigurationMut = useUpdateConfigurationMut(orgId);
  const ticketing = { ...configurationQuery.data?.channels?.ticketing }

  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm<ConfigTicketing>({ defaultValues: { ...configurationQuery.data?.channels?.ticketing }, resolver });
  const onSubmit = handleSubmit(async (data) => {
    // const updateBody: UpdateConfiguration = {
    //   ...configurationQuery.data, channels: {
    //     ...configurationQuery?.data?.channels, liveChat: { ...configurationQuery?.data?.channels?.liveChat, appearance: { ...data, widgetAppearance: { ...data.widgetAppearance, backgroundColor: selectedBackgroundColor }, } }
    //   }
    // }
    // await updateConfigurationMut.mutateAsync([orgId, updateBody])
  })

  const [addingEmail, setAddingEmail] = useState<boolean>(false);
  const [emails, setEmails] = useState<string[]>(ticketing?.emails ?? []);
  const deleteEmail = (idx: number) => {
    const tempEmails = [...emails ?? []]
    tempEmails.splice(idx, 1)
    setEmails(tempEmails);
  }

  useEffect(() => {
    console.log(ticketing.emails)
  }, [ticketing.emails])

  return (
    <div>
      <Collapse content={
        <div>
          {!!emails.length && (
            <div className='border-[1px] rounded-md mb-4'>
              <ul>
                {emails.map((email, i) => (
                  <li className='justify-between border-b-[1px] flex place-items-center px-2 py-4'>
                    <p>{email}</p>
                    <button onClick={() => deleteEmail(i)}>
                      <BsX className='text-2xl text-error'></BsX>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
          }
          <EmailModal emailState={[emails, setEmails]} />
        </div>
      } title={(
        <>
          <BsLink className='text-2xl' />
          {t('Sender address')}
        </>
      )} />
      <Collapse content={
        <div>
          {/* <EmailModal emailState={[emails, setEmails]} /> */}
        </div>
      } title={(
        <>
          <BsLink className='text-2xl' />
          {t('Automatic response')}
        </>
      )} />
      <Collapse title={(
        <>
          <BsLink className='text-2xl' />
          {t('Custom email signature')}
        </>
      )} />
      <Collapse title={(
        <>
          <BsLink className='text-2xl' />
          {t('Filtered emails')}
        </>
      )} />
      < form className='h-screen bg-white' onSubmit={onSubmit} >
        <div className='gap-y-2 border-t-[1px] pt-4'>
        </div>
        <div className='fixed t-0 gap-x-2'>
          <button className='normal-case btn btn-primary btn-sm btn-outline gap-x-2' type='submit'>
            {tDash('Save')}
          </button>
        </div>
      </form >
    </div >
  )
}