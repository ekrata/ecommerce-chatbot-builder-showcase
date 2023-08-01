import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { VisitorView } from './VisitorView';

export default function Page() {
  const searchParams = useSearchParams();
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { conversationState, conversationOperatorView, setConversationOperatorView } = useDashStore()

  // E.g. `/dashboard?page=2&order=asc`

  return (
    <div>
      <VisitorView />
    </div>
  )
}