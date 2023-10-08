'use client'
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { BotsNav } from './BotsNav';
import { BotsPanel } from './BotsPanel';

export default function Page() {
  const t = useTranslations('dash');
  const { helpCenterState } = useDashStore()

  const searchParams = useSearchParams();
  const articleId = searchParams?.get('articleId')
  const operator = useAuthContext()

  const render = useMemo(() => (
    <div className="grid max-h-screen grid-cols-12 max-w-screen">
      <div className='h-screen col-span-2'>
        <BotsNav />
      </div>
      <div className='h-screen col-span-10 shadow-2xl'>
        <BotsPanel title={'General'} />
      </div>
    </div>
  ), [articleId])

  return render
}