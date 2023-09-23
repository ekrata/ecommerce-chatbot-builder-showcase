import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';
import { VisitorView } from './VisitorView';

export default function Page() {
  const searchParams = useSearchParams();
  const t = useTranslations('dash');
  const [user] = useAuthContext();
  const { conversationState, conversationOperatorView, setConversationOperatorView } = useDashStore()

  return (
    <div>
      <VisitorView />
    </div>
  )
}