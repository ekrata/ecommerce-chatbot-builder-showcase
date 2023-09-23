'use client'

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { isDesktop } from 'react-device-detect';

import { SettingsMenu } from './SettingsMenu';

export default function Page() {
  const t = useTranslations('dash');
  const router = useRouter();

  if (isDesktop) {
    router.push('/settings/channels/live-chat/appearance')
  }

  return (
    <div>
      <SettingsMenu />
    </div>
  )
}