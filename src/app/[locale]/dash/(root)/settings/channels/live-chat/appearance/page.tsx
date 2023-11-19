'use client'

import { UpdateConfiguration } from 'aws-sdk/clients/verifiedpermissions';
import { useTranslations } from 'next-intl';
import { FC, ReactNode, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { BsEye, BsPaintBucket, BsPhone, BsSave } from 'react-icons/bs';
import { FaDesktop, FaPaintBrush, FaSave } from 'react-icons/fa';

import { ConfigLiveChatAppearance, deviceVisibility } from '@/entities/configuration';
import { Collapse } from '@/src/app/[locale]/(components)/Collapse';
import { useAuthContext } from '@/src/app/[locale]/(hooks)/AuthProvider';
import {
    useUpdateConfigurationMut
} from '@/src/app/[locale]/(hooks)/mutations/useUpdateConfigurationMut';
import { useConfigurationQuery } from '@/src/app/[locale]/(hooks)/queries/useConfigurationQuery';

const resolver: Resolver<ConfigLiveChatAppearance> = async (values) => {
  return {
    values,
    errors: {}
  };
};

const defaultBackgroundColor = "linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))"
const getTemplateColors = (currentColor: string) => [
  defaultBackgroundColor,
  "linear-gradient(to right, rgb(14, 165, 233), rgb(107, 33, 168), rgb(21, 128, 61))",
  "linear-gradient(to right, #f12711, #f5af19)",
  "linear-gradient(to right, #8a2387, #e94057, #f27121)",
  "linear-gradient(to right, #00b4db, #0083b0)",
  "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
  "linear-gradient(to right, #12c2e9, #c471ed, #f64f59)"
].filter((item) => item !== currentColor)


export default function Page() {
  const t = useTranslations('dash.settings')
  const tDash = useTranslations('dash')
  const [user] = useAuthContext()
  const orgId = user?.orgId ?? ''
  const configurationQuery = useConfigurationQuery(orgId);
  const updateConfigurationMut = useUpdateConfigurationMut(orgId);
  const { backgroundColor } = { ...configurationQuery.data?.channels?.liveChat?.appearance?.widgetAppearance }
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>(backgroundColor ?? defaultBackgroundColor)

  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm<ConfigLiveChatAppearance>({ defaultValues: { ...configurationQuery.data?.channels?.liveChat?.appearance }, resolver });
  const onSubmit = handleSubmit(async (data) => {
    const updateBody: UpdateConfiguration = {
      ...configurationQuery.data, channels: {
        ...configurationQuery?.data?.channels, liveChat: { ...configurationQuery?.data?.channels?.liveChat, appearance: { ...data, widgetAppearance: { ...data.widgetAppearance, backgroundColor: selectedBackgroundColor }, } }
      }
    } as UpdateConfiguration
    await updateConfigurationMut.mutateAsync([orgId, updateBody as any])
  })



  const selectedButton = `ring-2 outline-1 ring-primary`

  return (
    <form className='w-full mr-20 overflow-y-scroll bg-white' onSubmit={onSubmit} >
      <button className='fixed normal-case right-1 top-2 btn-sm btn btn-primary btn-outline gap-x-2 ' type='submit'>
        <FaSave />
        {tDash('Save')}
      </button>
      <div className='grid grid-cols-12 p-1 text-black gap-y-4'>
        <h3 className='flex w-full col-span-12 mb-6 text-xl font-semibold place-items-center gap-x-2'>
          <BsPaintBucket />
          {t('appearance.Widget Appearance')}
        </h3>
        <div className='col-span-3 place-items-center'>
          {t('appearance.Background Color')}
        </div>
        <div className='z-10 inline-flex col-span-9 text-black gap-x-2 place-items-center'>
          <div role='input' className={`w-8 h-8 rounded-full btn btn-sm ${selectedButton}`} style={{
            'background': selectedBackgroundColor
          }}>
          </div> {getTemplateColors(backgroundColor ?? '').slice(0, 6).map((color) =>
            <>
              <div role='input' className='w-8 h-8 text-black rounded-full btn btn-sm' onClick={() => setSelectedBackgroundColor(color)} style={{
                'background': color
              }}>
              </div>
            </>
          )}
          <div className="dropdown">
            <label tabIndex={0} className="m-1 btn btn-sm"><FaPaintBrush /></label>
            <ul tabIndex={0} className="flex p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52 ">
              {getTemplateColors(backgroundColor ?? '').slice(6).map((color) =>
                <input type='radio' className='w-8 h-8 rounded-full' onClick={() => setSelectedBackgroundColor(color)} style={{
                  'background': color
                }}>
                </input>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className='divider'></div>
      <div className='grid grid-cols-12'>
        <h3 className='flex w-full col-span-12 mb-6 text-xl font-semibold place-items-center gap-x-2 gap-y-2'>
          <BsEye />
          {t('appearance.Widget Visibility')}
        </h3>
        <div className='justify-start col-span-3 place-self- text-start'>
          {t('appearance.Widget Position')}
        </div>
        <div className='flex col-span-9 place-items-center gap-x-2'>
          <label>{t('appearance.Left')}</label>
          <input type="radio" className=" radio radio-primary" {...register('widgetAppearance.widgetPosition')} value='left' />
          <FaDesktop className='text-6xl' />
          <input type="radio" className="radio radio-primary" {...register('widgetAppearance.widgetPosition')} value='right' />
          <label>{t('appearance.Right')}</label>
        </div>
        <div className='col-span-3'>
          {t('appearance.Show Button Label')}
        </div>
        <div className='col-span-9'>
          <input type="checkbox" className="toggle toggle-primary"  {...register('widgetAppearance.enableButtonLabel')} />
        </div>
        <div className='col-span-3'>
          {t('appearance.Enable widget sounds')}
        </div>
        <div className='col-span-9'>
          <input type="checkbox" className="toggle toggle-primary"   {...register('widgetAppearance.enableWidgetSounds')} />
        </div>
      </div >
      <div className='grid grid-cols-12 p-1 gap-y-4' >
        <div className='col-span-3'>
          {t('appearance.Display Widget')}
        </div>
        <div className='col-span-9'>
          <input type="checkbox" className="toggle toggle-primary" checked {...register('widgetVisibility.displayWidget')} />
        </div>
        <div className='col-span-3'>
          {t('appearance.Devices')}
        </div>
        <div className='col-span-9'>
          <select className="max-w-xs ml-2 select select-bordered select-sm" {...register("widgetVisibility.devices", { required: true })}>
            {deviceVisibility.map((visibility) => (
              <option>{t(`appearance.${visibility}`)}</option>
            ))}
          </select>
        </div>
        <div className='col-span-3'>
          {t("appearance.Display the Chat When You're Offline")}
        </div>
        <div className='col-span-9'>
          <input type="checkbox" className="toggle toggle-primary" checked {...register('widgetVisibility.displayTheChatWhenOffline')} />
        </div>
        <div className='col-span-3'>
          {t('appearance.Let visitors create a Ticket when you’re offline')}
        </div>
        <div className='col-span-9'>
          <input type="checkbox" className="toggle toggle-primary" checked />
        </div>
      </div >
      <div className='divider'></div>
      <div className='grid grid-cols-12 p-1 gap-y-4'>
        <h3 className='flex w-full col-span-12 mb-6 text-xl font-semibold place-items-center gap-x-2 gap-y-2'>
          <BsPhone />
          {t('appearance.Mobile Widget')}
        </h3>
        <div className='justify-start col-span-3 place-self-center justify-self-start text-start'>
          {t('appearance.Button Position')}
        </div>
        <div className='col-span-9'>
          <div className='flex col-span-9 place-items-center gap-x-2'>
            <label>{t('appearance.Left')}</label>
            <input type="radio" className="radio radio-primary radio-sm" {...register('mobileWidget.buttonPosition')} value='left' />
            <BsPhone className='text-6xl' />
            <input type="radio" className="radio radio-primary radio-sm" {...register('mobileWidget.buttonPosition')} value='right' />
            <label>{t('appearance.Right')}</label>
          </div>
        </div>
        <div className='col-span-3'>
          {t('appearance.Button Size')}
        </div>
        <div className='col-span-9'>
          <Controller
            control={control}
            name='mobileWidget.buttonSize'
            defaultValue={'small'}
            render={({ field: { value, onChange } }) => (
              <>
                <input type="range" min={0} max="100" value={value} onChange={(event) => onChange(event)} className="range range-xs range-primary" step={50} />
                <div className="flex justify-between w-full px-2 text-xs">
                  <span>{t('appearance.small')}</span>
                  <span>{t('appearance.medium')}</span>
                  <span>{t('appearance.large')}</span>
                </div>
              </>
            )} />
        </div>

      </div>


    </form >
  )
}