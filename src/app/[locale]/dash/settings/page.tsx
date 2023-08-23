'use client'

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { SettingsMenu } from './SettingsMenu';

export default function Page() {
  const t = useTranslations('dash');
  const router = useRouter();
  const sessionOperator = useOperatorSession();

  if (isDesktop) {
    router.push('/settings/channels/live-chat/appearance')
  }

  return (
    <div>
      <SettingsMenu />
    </div>
  )
}