'use client'

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { isDesktop } from 'react-device-detect';

import { SettingsMenu } from './SettingsMenu';

export default function Page() {
  const t = useTranslations('dash');

  if (isDesktop) {
  }

  return (
    <div className='bg-white'>
    </div>
  )
}