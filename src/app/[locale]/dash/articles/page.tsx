import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { ArticlesView } from './ArticlesView';

export default function Page() {
  const searchParams = useSearchParams();
  const t = useTranslations('dash');
  const [user] = useAuthContext();
  const { conversationState, conversationOperatorView, setConversationOperatorView } = useDashStore()

  // E.g. `/dashboard?page=2&order=asc`

  return (
    <div>
      <ArticlesView />
    </div>
  )
}