import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { isDesktop } from 'react-device-detect';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { ConversationView } from './ChatView';
import { ConversationsListView } from './ConversationsListView';
import { ConversationsSearchView } from './ConversationsSearchView';
import { CustomerInfoView } from './CustomerInfoView';

export default function Page() {
  const searchParams = useSearchParams();
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { conversationState, conversationOperatorView, setConversationOperatorView } = useDashStore()

  // E.g. `/dashboard?page=2&order=asc`
  const conversationId = searchParams.get('conversationId');

  const renderMobile = () => {
    if (!conversationId) {
      return <ConversationView></ConversationView>
    } else if (conversationState === 'list') {
      return <ConversationsListView></ConversationsListView>
    } else if (conversationState === 'search') {
      return <ConversationsSearchView />
    } else if (conversationState === 'customerInfo') {
      return <CustomerInfoView ></CustomerInfoView>
    }
  }

  const render = () => {
    <div className="grid grid-cols-12">
      <div className='col-span-3'>
        {conversationState === 'list' && <ConversationsListView></ConversationsListView>}
        {conversationState === 'search' && <ConversationsSearchView></ConversationsSearchView>}
      </div>
      <div className='col-span-6'>
        <ConversationView />
      </div>
      <div className='col-span-3'>
        <CustomerInfoView></CustomerInfoView>
      </div>

    </div>
  }

  return isDesktop ? render() : renderMobile();
}