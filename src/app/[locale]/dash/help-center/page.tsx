'use client'
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { ArticlesView } from './ArticlesView';
import { EditorView } from './EditorView';

export default function Page() {
  const t = useTranslations('dash');
  const { helpCenterState } = useDashStore()

  const searchParams = useSearchParams();
  const articleId = searchParams?.get('articleId')
  const operator = useAuthContext()
  const { conversationState } = useDashStore()

  const renderMobile = useMemo(() => {
    if (!articleId) {
      return <ArticlesView />
    }
    else if (articleId) {
      return <EditorView articleId='articleId' />
    }
  }, [articleId])

  const render = useMemo(() => (
    <div className="grid max-h-screen grid-cols-12 max-w-screen">
      <div className='h-screen col-span-3'>
        {conversationState === 'list' && <ArticlesView />}
      </div>
      <div className='h-screen col-span-9 shadow-2xl'>
        <EditorView articleId={articleId ?? ''} />
      </div>
    </div>
  ), [articleId])

  return isDesktop ? render : renderMobile;

}