import { useTranslations } from 'next-intl';
import { Dispatch, FC, SetStateAction, useRef, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { BiMailSend } from 'react-icons/bi';
import { useOnClickOutside } from 'usehooks-ts';
import * as yup from 'yup';

import { CopyToClipboard } from '@/app/[locale]/(components)/CopyToClipboard';
import { useOperatorSession } from '@/app/[locale]/(helpers)/useOperatorSession';
import { useConfigurationQuery } from '@/app/[locale]/(hooks)/queries';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup
  .object()
  .shape({
    email: yup.string().required(),
  })
  .required();


interface Props {
  emailState: [string[], Dispatch<SetStateAction<string[]>>]
}

type EmailType = 'new' | 'existing'
type EmailProviderType = 'google' | 'microsoft' | 'other mailbox provider'

export const EmailModal: FC<Props> = ({ emailState }) => {
  const t = useTranslations('dash.settings.Ticketing')
  const tDash = useTranslations('dash')
  const { orgId } = useOperatorSession()
  const dialogRef = useRef(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailType, setEmailType] = useState<EmailType>('existing')
  const [providerType, setProviderType] = useState<EmailProviderType>('google')
  const configuration = useConfigurationQuery(orgId);
  const { forwardingEmail } = { ...configuration.data?.channels?.ticketing }

  const [emails, setEmails] = emailState
  const { register, handleSubmit, getValues, formState: { errors }
  } = useForm<{ email: string }>({ defaultValues: {}, resolver: yupResolver(schema), });
  const onSubmit = handleSubmit(async (data) => {
    setEmails([...emails, data.email])
  })

  useOnClickOutside(dialogRef, () => {
    window?.create_email_modal?.close()
  })

  const pageOne = (
    <>
      <div className="w-full mb-4 text-center ">
        <h3 className='text-3xl'>
          {t('Choose email type')}
        </h3>
        {t('You can connect your existing mailbox or create a new one with a eChat domain')}
      </div>
      <div className="w-3/4 form-control">
        <label className="label">
          <span className="font-semibold label-text">{t('Email type')}</span>
        </label>
        <select className="max-w-xs select select-bordered select-sm" onChange={(event) => setEmailType(event.currentTarget.value as EmailType)}>
          <option value='existing'>{t('Connect with your existing email')}</option>
          <option value='new'>{t('Create a new email address')}</option>
        </select>
      </div>
      <div className='flex w-3/4 mb-4 place-items-center gap-x-1'>
        {emailType === 'new' && <input placeholder={'email'} className={`w-full input input-bordered btn-sm`} {...register('email', { required: true })} />}
        {emailType === 'new' && <label className='text-xs text-gray-400'>@eChat.ekrata.xyz</label>}
        {emailType === 'existing' && (
          <>
            <input type='email' placeholder={'email'} className={`w-full input input-bordered btn-sm`} {...register('email', { required: true })} />
            {errors?.email && <label className='text-error'>{errors.email.message}</label>}
          </>
        )}
      </div>
      <div className='flex'>
        <button className="normal-case btn btn-sm btn-primary" onClick={() => {
          if (emailType === 'new') {
            onSubmit()
          }
          setStep(2)
        }}> {tDash('Next')}</button >
      </div>
    </>
  )

  const pageTwo = (
    <>
      <div className="w-full mb-4 text-center ">
        <h3 className='text-3xl'>
          {t('Choose provider')}
        </h3>
      </div>
      <div className="flex flex-col form-control place-items-center gap-y-1">
        <span className="flex flex-col label-text place-items-center gap-y-1">
          <img src="/brands/Gmail.svg" className='w-12 h-12 object - fill ' alt="Fb messenger" />
          <span>Gmail, Google apps</span>
        </span>
        <input type="radio" name="radio-2" className="radio radio-primary" value={'google'} onChange={() => setProviderType('google')} />
      </div>
      <div className="flex flex-col form-control place-items-center gap-y-1">
        <span className="flex flex-col label-text place-items-center gap-y-1">
          <img src="/brands/Outlook.svg" className='w-12 h-12 ' alt="Fb messenger" />
          <span>Outlook, Office365</span>
        </span>
        <input type="radio" name="radio-2" className="radio radio-primary" value={'microsoft'} onChange={() => setProviderType('microsoft')} />
      </div>
      <div className="flex flex-col mb-4 form-control place-items-center gap-y-1">
        <span className="flex flex-col label-text place-items-center gap-y-1">
          <BiMailSend className='w-12 h-12' />
          <span>{t('Other email provider')}</span>
        </span>
        <input type="radio" name="radio-2" className="radio radio-primary" value={'other mailbox provider'} onChange={() => setProviderType('other mailbox provider')} />
      </div>
      <div className='flex gap-x-4'>
        <button className="normal-case btn btn-sm btn-primary" onClick={() => {

          setStep(1)
        }}> {tDash('Back')}</button >
        <button className="normal-case btn btn-sm btn-primary" disabled={!providerType} onClick={() => {
          setStep(3)
        }}> {tDash('Next')}</button >
      </div>
    </>
  )

  const googleInstructions = (
    <ol className='px-6 space-y-4 overflow-y-scroll list-decimal'>
      <li>
        {t('google.Select the Gear icon from the top right corner of your Google mail dashboard and choose Settings')}
        <img src="/settings/ticketing/Gmail1.png" className='' alt="Gmail1" />
      </li>
      <li>
        {t("google.Choose the 'Forwarding and POP/IMAP' tab in the settings and click on the 'Add a forwarding address' button in the middle")}
        <img src="/settings/ticketing/Gmail2.png" className='' alt="Gmail2" />
      </li>
      <li>
        {t("google.Copy the following email address and paste it in the 'Please enter a new forwarding email address:' field and click on the 'Next button'")}
        <CopyToClipboard value={forwardingEmail}></CopyToClipboard>
        <img src="/settings/ticketing/Gmail3.png" className='' alt="Gmail3" />
      </li>
      <li>
        {t("google.Please wait for a confirmation email and click on the Verification link to activate the forwarding Also, make sure that you have selected the 'Forward a copy of incoming mail to' checkbox in your Forwarding settings in Gmail")}
        <img src="/settings/ticketing/Gmail4.png" className='' alt="Gmail4" />
      </li>
    </ol>
  )

  const microsoftInstructions = (
    <ol className='px-6 space-y-4 overflow-y-scroll list-decimal'>
      <li>
        {t("microsoft.Select the Gear icon from the top right corner of your Inbox and choose 'Options'")}
        <img src="/settings/ticketing/Outlook1.png" className='' alt="Outlook1" />
      </li>
      <li>
        {t("microsoft.From the Options page, click on 'Forwarding' tab in 'Account' section")}
        <img src="/settings/ticketing/Outlook2.png" className='' alt="Outlook2" />
      </li>
      <li>
        {t("microsoft.Copy the following email address and paste it in the 'Forward my email to:' field and click on the 'Save' button")}
        <CopyToClipboard value={forwardingEmail}></CopyToClipboard>
        <img src="/settings/ticketing/Outlook3.png" className='' alt="Outlook3" />
      </li>
    </ol>
  )

  const otherInstructions = (
    <>
      {t('other.To integrate your mailbox, set up automatic forwarding in your current email, to the email address below')}
      <div className='flex flex-row'>

      </div>
    </>
  )

  const pageThree = (
    <>
      <div className="w-full mb-6 text-center ">
        <h3 className='text-3xl'>
          {t('Follow email instructions')}
        </h3>
      </div>
      {providerType === 'google' && googleInstructions}
      {providerType === 'microsoft' && microsoftInstructions}
      {providerType === 'other mailbox provider' && otherInstructions}
      <div className='flex gap-x-4'>
        <button className="normal-case btn btn-sm btn-primary" onClick={() => {
          setStep(2)
        }}> {tDash('Back')}</button >
        <button className="normal-case btn btn-sm btn-primary" onClick={() => {
          window.create_email_modal.close()
        }}> {tDash('Done')}</button >
      </div>
    </>
  )

  return (
    <>
      <button className="normal-case btn btn-sm btn-primary" onClick={() => window?.create_email_modal?.showModal()}> {t('Connect new email')}</button >
      <dialog id="create_email_modal" className="bg-transparent" >
        <form method="dialog" className="flex flex-col gap-y-4 modal-box w-[30rem] place-items-center" ref={dialogRef} onSubmit={onSubmit}>
          <ul className="z-10 py-4 steps">
            <li className="step step-primary"></li>
            <li className={`step ${step > 1 && 'step-primary'}`}></li>
            <li className={`step ${step > 2 && 'step-primary'}`}></li>
          </ul>
          <button type="button" className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2" onClick={() => {
            window.create_email_modal.close()
          }}>✕</button>
          {step === 1 && pageOne}
          {step === 2 && pageTwo}
          {step === 3 && pageThree}
        </form>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog >
    </>
  )
}