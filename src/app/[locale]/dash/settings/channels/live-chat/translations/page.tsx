'use client'
import { useLocale, useTranslations } from 'next-intl';
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { BsChevronUp } from 'react-icons/bs';
import { useCopyToClipboard } from 'usehooks-ts';

import { useOperatorSession } from '@/app/[locale]/(helpers)/useOperatorSession';
import {
  useDeleteChatWidgetTranslation
} from '@/app/[locale]/(hooks)/mutations/useDeleteChatWidgetTranslation';
import { useUpdateTranslationMut } from '@/app/[locale]/(hooks)/mutations/useUpdateTranslationMut';
import { useConfigurationQuery, useOrgQuery } from '@/app/[locale]/(hooks)/queries';
import { useTranslationQuery } from '@/app/[locale]/(hooks)/queries/useTranslationQuery';
import { UpdateTranslation } from '@/entities/entities';
import { ChatWidgetTranslations, Translation } from '@/entities/translation';

const languageCodes = ['en', 'es', 'de', 'zh', 'fr', 'ar', 'bn', 'pa'] as const


const languages = ['English', 'Spanish', 'German', 'Chinese', 'French', 'Arabic', 'Bengali', 'Punjabi (Panjabi)']
export type LanguageCode = (typeof languageCodes)[number]
const languageCodeMap = languageCodes.map((langCode, i) => ({ [langCode]: languages[i] }))

const resolver: Resolver<ChatWidgetTranslations> = async (values) => {
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

interface Props {
  title: ReactNode,
  content: ReactNode
}

const Collapse: FC<Props> = ({ title, content }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="bg-white collapse border-b-[1px] " onClick={() => setOpen(!open)}>
      <input type="checkbox" />
      <div className={`flex justify-between text-xl font-medium collapse-title `}>
        {title}
        <BsChevronUp className={`${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="collapse-content">
        {content}
      </div>
    </div>
  )
}




export default function Page() {
  const t = useTranslations('dash.settings.translations')
  const tDash = useTranslations('dash')
  const { orgId } = useOperatorSession()
  const configurationQuery = useConfigurationQuery(orgId);
  const locale = useLocale();
  const orgQuery = useOrgQuery(orgId);
  const [tab, setTab] = useState<LanguageCode>(locale as LanguageCode ?? 'en');
  const translationQuery = useTranslationQuery(orgId, tab);
  const translationMut = useUpdateTranslationMut(orgId, tab)
  const deleteChatWidgetTranslation = useDeleteChatWidgetTranslation(orgId, tab)
  const [value, copy] = useCopyToClipboard()

  const chatWidgetTranslations: Partial<ChatWidgetTranslations> = useMemo(() => ({ ...translationQuery.data?.translations.chatWidget }), [translationQuery.isFetching]);

  useEffect(() => {

    console.log(translationQuery.data)
  }, [translationQuery.isFetching])
  console.log(chatWidgetTranslations)
  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm<ChatWidgetTranslations>({ defaultValues: chatWidgetTranslations, resolver });
  const onSubmit = handleSubmit(async (data) => {
    translationMut.mutateAsync([orgId, tab, data as UpdateTranslation])
  })

  const renderTab = useCallback(() =>
    Object.entries(chatWidgetTranslations).map(([key, value]) =>
      key ? (
        <div className='grid grid-cols-12 mb-4 text-sm'>
          <div className='col-span-6 place-items-center'>
            <label>{key}</label>
          </div>
          <div className='col-span-6 place-items-center'>
            <textarea className="w-full max-w-xs text-sm textarea textarea-bordered textarea-lg" {...(register(key as keyof ChatWidgetTranslations), { required: true })} value={value}></textarea>
          </div>
        </div>
      ) : undefined
    ), [chatWidgetTranslations])


  return (
    <form className='h-screen bg-white' onSubmit={onSubmit}>
      <div className='w-full border-b-[1px] mb-5 text-3xl '>
        <h3>
          {t('Translations')}
        </h3>
      </div>
      <div className="bg-white tabs tabs-boxed ">
        {languageCodeMap.map((item) => {
          const [[key, value]] = Object.entries(item)
          return (
            key === tab ? <a className="tab tab-active" onClick={() => setTab(key)}>{value}</a> :
              <a className='tab' onClick={() => setTab(key as LanguageCode)}>
                {value}
              </a>)
        })}
      </div>
      <div className='gap-y-2 border-t-[1px] pt-4'>
        {renderTab()}
      </div>
      <div className='fixed t-0 gap-x-2'>
        <button className='normal-case btn btn-primary btn-sm btn-error gap-x-2' onClick={() => {
          deleteChatWidgetTranslation.mutateAsync([orgId, tab, { ...translationQuery.data }])
        }}>
          {t('Delete language')}
        </button>
        <button className='normal-case btn btn-primary btn-sm btn-outline gap-x-2' type='submit'>
          {tDash('Save')}
        </button>
      </div>
    </form >
  )
}