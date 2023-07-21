'use-client'
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { BiSend } from 'react-icons/bi';

import {
  useConversationItemsByCustomerQuery
} from '@/app/[locale]/(hooks)/queries/useConversationItemsQuery';
import { ConversationItem } from '@/entities/conversation';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { getItem } from '../../(helpers)/helpers';
import { useConfigurationQuery } from '../../../(hooks)/queries';
import { useCustomerQuery } from '../../../(hooks)/queries/useCustomerQuery';
import { DynamicBackground } from '../../DynamicBackground';
import { CustomerMessageTimeLabel } from './CustomerMessageTimeLabel';

interface Props {
  conversationItem: ConversationItem
  height: string,
  rounded?: boolean
  showRecentLabel?: boolean
}

/**
 * Renders a chat containing info about a conversation from the perspective of the customer. Clicking on it creates a new conversation and redirects to the chat screen. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const CustomerConversationCard: React.FC<Props> = ({ conversationItem, height = '12', rounded = false, showRecentLabel }) => {
  const { chatWidget: { setWidgetState, setSelectedConversationId } } = useChatWidgetStore()
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const t = useTranslations('chat-widget');
  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  const { relativeTime } = useFormatter()
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);

  const lastMessage = useMemo(() => {
    return conversationItem?.messages?.slice(-1)[0]
  }, [conversationItem])


  return (
    <button className={`btn btn-ghost block ${rounded && 'rounded-3xl'} font-light justify-between h-${height}  normal-case place-items-center animate-fade-left w-full  text-sm`}
      onClick={() => {
        setWidgetState('conversations');
        setSelectedConversationId(conversationItem?.conversation.conversationId)
      }}>
      {showRecentLabel && <div className="flex pb-2 pl-2 mb-2 font-semibold">
        {t('Recent message')}
      </div>}
      <div className="flex justify-around place-items-center animate-fade-left">
        <div className="w-12 h-12 p-2 rounded-full avatar shrink-0 background ring-2 ring-primary online">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
          <img src={widgetAppearance?.botLogo}></img>
        </div>
        <div className="flex flex-col w-3/5 place-items-start gap-y-1">
          <h5 className='justify-start w-full text-base break-all truncate font-base justify-self-start'>{`${lastMessage?.content}`}</h5>
          <div className="flex text-xs text-neutral-400 gap-x-1 ">
            <CustomerMessageTimeLabel conversationItem={conversationItem} />
          </div>
        </div>
        <BiSend className="text-2xl shrink-0 justify-self-end justify-right " />
      </div>
    </button>
  )
}