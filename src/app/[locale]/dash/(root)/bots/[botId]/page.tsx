'use client'
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { BotEditor } from './BotEditor';

export default function Page() {
  const t = useTranslations('dash');
  const params = useParams()
  const botId = params?.['botId']

  const render = useMemo(() => (
    <div className="max-h-screen max-w-screen">
      <div className='h-screen shadow-2xl'>
        <BotEditor />
      </div>
    </div>
  ), [botId])

  return render
}