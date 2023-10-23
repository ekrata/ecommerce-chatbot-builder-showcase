'use client'

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { VisitorView } from './VisitorView';

export default function Page() {
  const searchParams = useSearchParams();
  const t = useTranslations('dash');
  const [user] = useAuthContext();
  const { helpCenterState } = useDashStore()

  const articleId = searchParams?.get('articleId')
  const operator = useAuthContext()
  const { conversationState } = useDashStore()

  const render = useMemo(() => (
    <div className="w-screen max-h-screen">
      <VisitorView />
    </div>
  ), [])

  return render
}