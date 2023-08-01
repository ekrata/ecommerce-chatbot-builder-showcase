'use client'
import 'react-quill/dist/quill.snow.css';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { v4 as uuidv4 } from 'uuid';

import { EditorView } from './EditorView';

export default function Page() {
  const params = useParams()
  const articleId = params?.['articleId']
  console.log(params)

  return (
    <EditorView articleId={articleId} />
  )
}
