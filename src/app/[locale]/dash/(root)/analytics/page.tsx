'use client'

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { AnalyticsView } from './AnalyticsView';

export default function Page() {
  const searchParams = useSearchParams();


  return (
    <div className="w-screen max-h-screen overflow-y-scroll">
      {<AnalyticsView />}
    </div>
  )
}