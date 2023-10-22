'use client'
import 'react-quill/dist/quill.snow.css';

import { useTranslations } from 'next-intl';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { BiSave, BiTrash } from 'react-icons/bi';
import { BsInfo } from 'react-icons/bs';
import { MdOutlineArticle } from 'react-icons/md';
import ReactQuill from 'react-quill';
import { v4 as uuidv4 } from 'uuid';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import {
  useCreateArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useCreateArticleContentMut';
import { useCreateArticleMut } from '@/app/[locale]/(hooks)/mutations/useCreateArticleMut';
import {
  useDeleteArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useDeleteArticleContentMut';
import { useDeleteArticleMut } from '@/app/[locale]/(hooks)/mutations/useDeleteArticleMut';
import {
  useUpdateArticleContentMut
} from '@/app/[locale]/(hooks)/mutations/useUpdateArticleContentMut';
import { useUpdateArticleMut } from '@/app/[locale]/(hooks)/mutations/useUpdateArticleMut';
import {
  getArticleWithContent
} from '@/app/[locale]/chat-widget/(actions)/orgs/articles/getArticleWithContent';
import { ArticleCategory, articleCategory, articleStatus, ArticleStatus } from '@/entities/article';
import { useQuery } from '@tanstack/react-query';

import { QueryKey } from '../../(hooks)/queries';
import { useNotificationContext } from '../NotificationProvider';

type FormValues = {
  title: string;
  category: ArticleCategory,
  status: ArticleStatus,
  subtitle: string;
  content: string;
  htmlContent: string;
};

interface Props {
  articleId?: string
}

const editorSkeleton =
  (< div className="flex flex-col w-full h-screen p-2 my-2 animate-pulse gap-y-6" >

    <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
    <div className="gap-y-12">
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-14 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-14 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-32 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-64 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-24 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="h-2 bg-gray-200 rounded-full w-60 dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-20 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-20 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-14 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
      <div className='flex flex-col w-full gap-y-2'>
        <div className="h-2.5 w-14 bg-gray-300 rounded-full dark:bg-gray-600" />
        <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
      </div>
    </div>
    {
      [...Array(10)].map(() => (
        <div className="flex w-full place-items-center animate-fade-left">
          <div className='flex flex-col w-full gap-y-2'>
            <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
          </div>
        </div>))
    }
  </div >
  )

export const EditorView: React.FC = () => {
  const searchParams = useSearchParams()
  const articleId = searchParams?.get('articleId')
  const router = useRouter()
  const pathname = usePathname()
  const toast = useNotificationContext()
  const newArticleId = uuidv4()
  const newArticleContentId = uuidv4()
  const t = useTranslations('dash');
  const [user] = useAuthContext();
  const orgId = user?.orgId ?? ''

  const [lang, setLang] = useState<string>('en');
  const [editorHtml, setEditorHtml] = useState<string>();

  const articleWithContentQuery = useQuery([QueryKey.articleWithContent, orgId, lang, articleId], async () => getArticleWithContent(orgId, lang, articleId ?? ''),
    { enabled: !!(!!orgId && !!lang && articleId !== 'new') }
  )

  const article = articleWithContentQuery?.data

  const updateArticleMut = useUpdateArticleMut(orgId, lang, articleId ?? '')
  const updateArticleContentMut = useUpdateArticleContentMut(orgId, lang, articleWithContentQuery.data?.articleContentId ?? '')

  const createArticleMut = useCreateArticleMut(orgId, lang, newArticleId)
  const createArticleContentMut = useCreateArticleContentMut(orgId, lang, newArticleId)

  const deleteArticleMut = useDeleteArticleMut(orgId, lang, articleId ?? '');
  const deleteArticleContentMut = useDeleteArticleContentMut(orgId, lang, articleWithContentQuery.data?.articleContentId ?? '');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();

  const onDelete = async () => {
    const [articleRes, articleContentRes] = await toast.promise(() => Promise.all([deleteArticleMut.mutateAsync([orgId, lang, newArticleId]), deleteArticleContentMut.mutateAsync([orgId, lang, newArticleContentId])]), {
      pending: t('Deleting article'),
      success: t('Deleted article'),
      error: t('Failed to delete article')
    }, { position: 'bottom-right' })
    router.push(`${pathname ?? ''}`)
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (articleId === 'new') {
      const [articleRes, articleContentRes] = await toast.promise(() => Promise.all([createArticleMut.mutateAsync([orgId, lang, newArticleId, { orgId, articleContentId: newArticleContentId, category: data.category, title: data.title, subtitle: data.subtitle, status: data.status }]), createArticleContentMut.mutateAsync([orgId, lang, newArticleContentId, { orgId, articleId: newArticleId }])]), {
        pending: t('Creating article'),
        success: t('Created article'),
        error: t('Failed to create article')
      }, { position: 'bottom-right' })
      router.push(`${pathname ?? ''}?articleId=${articleRes?.articleId}`)
    }
    else if (articleId && articleWithContentQuery.data?.articleId && articleWithContentQuery.data?.articleContentId) {
      await toast.promise(() => Promise.all([updateArticleMut.mutateAsync([orgId, lang, articleWithContentQuery.data?.articleId, { articleContentId: articleWithContentQuery.data?.articleContentId, category: data.category, title: data.title, subtitle: data.subtitle, status: data.status }]), updateArticleContentMut.mutateAsync([orgId, lang, articleWithContentQuery.data?.articleContentId, { ...data }])]),
        {
          pending: t('Updating article'),
          success: t('Updated article'),
          error: t('Failed to update article')
        }, { position: 'bottom-right' })
    }
  }


  // When data loads for api
  useEffect(() => {
    if (articleId === 'new') {
      setValue('title', "Title for new article")
      setValue('subtitle', "Subtitle for new article")
      setValue('category', "General Information")
      setValue('status', "Draft")
      setEditorHtml('')
    }
    if (articleWithContentQuery?.data) {
      const { title, subtitle, category, status, articleContent } = articleWithContentQuery.data
      setValue('title', title)
      subtitle && setValue('subtitle', subtitle)
      setValue('category', category)
      setValue('status', status)
      articleContent && setEditorHtml(articleContent.content)
    }

  }, [articleId, articleWithContentQuery?.dataUpdatedAt])
  /* 
  * Quill modules to attach to editor
  * See https://quilljs.com/docs/modules/ for complete options
  */
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  }
  /* 
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ]

  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'><MdOutlineArticle className='text-2xl' />{t('No article selected', { count: 0 })}</h5>
      {/* <p className='flex text-xs text-neutral-400'>{`${t('')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p> */}
    </div>
  )

  const renderContent = useMemo(() => {
    return (
      < div className="w-full h-screen p-2 bg-white" >
        {!articleId && noData}
        {articleWithContentQuery?.isFetching ? editorSkeleton :
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-row justify-between'>
              <h3 className="justify-start text-2xl font-semibold justify-self-center place-items-center label-text">{t('Article')}</h3>
              <div className='flex justify-end gap-x-2'>
                <button type="submit" className='max-w-xs normal-case gap-x-2 btn btn-outline btn-ghost btn-sm '><BiSave className='text-xl' />{t('Save')}</button>
                {articleId && articleId !== 'new' && <button type='button' className='max-w-sm normal-case gap-x-2 btn btn-outline btn-error btn-sm' onClick={onDelete}>{t('Delete article')}<BiTrash className="text-xl" /></button>}
              </div>
            </div>
            <div className="flex flex-col justify-start w-full p-2">
              <div className="w-full max-w-lg form-cotrol">
                <label className="label">
                  <span className="font-semibold label-text">{t('Title')}</span>
                </label>
                <input {...register("title", { required: true })} className="justify-between w-full max-w-xl ml-2 font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder={t('Title')} />
                {errors?.title && <p>{errors?.title.message?.toString()}</p>}
              </div>
              <div className="w-full max-w-xl form-control">
                <label className="label">
                  <span className="font-semibold label-text">{t('Subtitle')}</span>
                </label>
                <input {...register("subtitle")} className="justify-between w-full ml-2 font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder={t('Subtitle')} />
              </div>
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <span className="font-semibold label-text">{t('Category')}</span>
                </label>
                <select className="max-w-xs ml-2 select select-bordered select-sm" {...register("category", { required: true })}>
                  <option disabled selected>{t('Category')}</option>
                  {articleCategory.map((category) => (
                    <option>{t(`articleCategory.${category}`)}</option>
                  ))}
                </select>
              </div>
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <span className="font-semibold label-text">{t('Status')}</span>
                </label>
                <select className="w-full max-w-xs ml-2 select select-bordered select-sm" {...register("status", { required: true })}>
                  <option disabled selected>{t('Status')}</option>
                  {articleStatus.map((status) => (
                    <option>{t(`articleStatus.${status}`)}</option>
                  ))}
                  <div className="tooltip" data-tip={t('Status Info')}>
                    <button className="btn"><BsInfo /></button>
                  </div>
                </select>
              </div>
              <ReactQuill
                theme={'snow'}
                onChange={(html: string) => setEditorHtml(html)}
                value={editorHtml}
                modules={modules}
                formats={formats}
                bounds={'.app'}
                className='h-[540px] bottom-0 max-h-screen min-h-full mt-5'
                placeholder={'Write something...'
                }
              />
            </div>
          </form>}
      </div >
    )
  }, [articleId, articleWithContentQuery?.dataUpdatedAt])

  return <div>{renderContent}</div>
}
