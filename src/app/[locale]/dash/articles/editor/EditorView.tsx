'use client'
import 'react-quill/dist/quill.snow.css';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { v4 as uuidv4 } from 'uuid';

import {
  getArticleWithContent
} from '@/app/[locale]/(chat-widget)/(actions)/orgs/articles/getArticleWithContent';
import { useOperatorSession } from '@/app/[locale]/(helpers)/useOperatorSession';
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
import { ArticleCategory, articleCategory, articleStatus, ArticleStatus } from '@/entities/article';
import { useQuery } from '@tanstack/react-query';

type FormValues = {
  title: string;
  category: ArticleCategory,
  status: ArticleStatus,
  subtitle: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: { title: values.title ?? '', category: values.category ?? '', status: values.status ?? '', subtitle: values.subtitle ?? '' },
    errors: {
      title: !values.title
        ? {
          type: 'required',
          message: 'This is required.',
        }
        : '',
      category: !values.category
        ?
        {
          type: 'required',
          message: 'This is required.',
        }
        : '',
      status: !values.status
        ?
        {
          type: 'required',
          message: 'This is required.',
        }
        : '',
    }
  };
};

interface Props {
  articleId?: string
}

export const EditorView: React.FC<Props> = ({ articleId }) => {
  const newArticleId = uuidv4()
  const newArticleContentId = uuidv4()
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();


  const [lang, setLang] = useState<string>('english');
  const { orgId } = sessionOperator
  const [editorHtml, setEditorHtml] = useState<string>();

  const articleWithContentQuery = useQuery([orgId, lang, articleId], async () => getArticleWithContent(orgId, lang, articleId ?? ''), { enabled: !!(!!orgId && !!lang && articleId !== 'new') })
  const article = articleWithContentQuery?.data

  const updateArticleMut = useUpdateArticleMut(orgId, lang, articleId ?? '')
  const updateArticleContentMut = useUpdateArticleContentMut(orgId, lang, articleWithContentQuery.data?.articleContentId ?? '')

  const createArticleMut = useCreateArticleMut(orgId, lang, newArticleId)
  const createArticleContentMut = useCreateArticleContentMut(orgId, lang, newArticleId)

  const deleteArticleMut = useDeleteArticleMut(orgId, lang, articleId ?? '');
  const deleteArticleContentMut = useDeleteArticleContentMut(orgId, lang, articleWithContentQuery.data?.articleContentId ?? '');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver });
  const onSubmit = handleSubmit(async (data) => {
    if (articleId === 'new') {
      const articleRes = await createArticleMut.mutateAsync([orgId, lang, newArticleId, { orgId, articleContentId: newArticleContentId, category: data.category, title: data.title, subtitle: data.subtitle, status: data.status }]);
      if (articleRes.articleId) {
        await createArticleContentMut.mutateAsync([orgId, lang, newArticleContentId, { orgId, articleId: newArticleId }]);
      }
    }
    else if (articleId && articleWithContentQuery.data?.articleId && articleWithContentQuery.data?.articleContentId) {
      const articleRes = await updateArticleMut.mutateAsync([orgId, lang, articleWithContentQuery.data?.articleId, { orgId, articleContentId: articleWithContentQuery.data?.articleContentId, category: data.category, title: data.title, subtitle: data.subtitle, status: data.status }]);
      if (articleRes.articleId) {
        await updateArticleContentMut.mutateAsync([orgId, lang, articleWithContentQuery.data?.articleContentId, { orgId, articleId: articleWithContentQuery.data?.articleId }]);
      }
    }
  });

  const handleDelete = async () => {
    await deleteArticleMut.mutateAsync([orgId, lang, articleId ?? ''])
    await deleteArticleContentMut.mutateAsync([orgId, lang, articleWithContentQuery.data?.articleContentId ?? ''])
  }

  // When data loads for api
  useEffect(() => {
    if (articleWithContentQuery.data) {
      const { title, subtitle, category, status, articleContent } = articleWithContentQuery.data
      setValue('title', title)
      subtitle && setValue('subtitle', subtitle)
      setValue('category', category)
      setValue('status', status)
      articleContent && setEditorHtml(articleContent.content)
    }

  }, [articleWithContentQuery.isFetched])
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

  return (
    <div className='bg-white'>
      <h3 className="text-2xl font-semibold justify-self-center place-items-center label-text">{t('Article')}</h3>
      <form className="flex flex-col justify-start w-full p-2" onSubmit={onSubmit}>
        <div className="w-full max-w-lg form-control">
          <label className="label">
            <span className="font-semibold label-text">{t('Title')}</span>
          </label>
          <input {...register("title")} className="justify-between w-full max-w-xl ml-2 font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder={t('Title')} />
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
          </select>
        </div>
        <ReactQuill
          theme={'snow'}
          onChange={(html: string) => setEditorHtml(html)}
          value={editorHtml}
          modules={modules}
          formats={formats}
          bounds={'.app'}
          className='h-[420px] mt-5 mb-20'
          placeholder={'Write something...'
          }
        />
        <button type='submit' className='max-w-xs normal-case btn btn-outline btn-sm btn-primary'>{t('Save')}</button>
        {articleId && articleId !== 'new' && <button className='max-w-sm normal-case btn btn-error btn-sm' onClick={handleDelete}>Delete article</button>}
      </form >
    </div >
  );
}
