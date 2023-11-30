import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { ArticlesView } from './ArticlesView';
import { EditorView } from './EditorView';

export default function Page() {
  const searchParams = useSearchParams();
  const articleId = searchParams?.get('articleId')
  const { conversationState } = useDashStore()


  const renderMobile = useMemo(() => {
    if (!articleId) {
      return <ArticlesView />
    }
    else if (articleId) {
      return <EditorView />
    }
  }, [articleId])

  const render = useMemo(() => (
    <Suspense fallback={<div className='loader loading-spinner loading-xs'></div>}>
      <div className="grid max-h-screen grid-cols-12 max-w-screen">
        <div className='h-screen col-span-3'>
          {conversationState === 'list' && <ArticlesView />}
        </div>
        <div className='h-screen col-span-9 shadow-2xl'>
          <EditorView />
        </div>
      </div>
    </Suspense>
  ), [articleId])

  return isDesktop ? render : renderMobile;

}