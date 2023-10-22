'use-client'
import { EntityItem } from 'electrodb';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { BiSend } from 'react-icons/bi';

import { useConfigurationQuery } from '@/app/(actions)/queries/useConfigurationQuery';
import { useCustomerQuery } from '@/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from '@/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from '@/app/(helpers)/DynamicBackground';
import { Configuration } from '@/entities/configuration';
import { ConversationItem } from '@/entities/conversation';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { Avatar } from './Avatar';
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
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const t = useTranslations('chat-widget');
  const customer = useCustomerQuery(orgId);
  const configuration = useConfigurationQuery(orgId);
  const widgetAppearance = { ...configuration.data?.channels?.liveChat?.appearance }
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);

  const lastMessage = useMemo(() => {
    return conversationItem?.messages?.slice(-1)[0]
  }, [conversationItem])


  return (
    <button className={`btn btn-ghost block ${rounded && 'rounded-3xl'} font-light justify-between h-${height}  normal-case place-items-center animate-fade-left w-full  text-sm`}
      onClick={() => {
        setWidgetState('conversations');
        setSelectedConversationId(conversationItem?.conversationId)
      }}>
      {showRecentLabel && <div className="flex pb-2 pl-2 mb-2 font-semibold">
        {t('Recent message')}
      </div>}
      <div className="flex justify-around place-items-center animate-fade-left">
        <Avatar conversationItem={conversationItem}></Avatar>
        {/* <div className="w-12 h-12 p-2 rounded-full avatar shrink-0 background ring-2 ring-primary online">
          {configuration.data && <DynamicBackground configuration={configuration?.data as EntityItem<typeof Configuration>} />}
          <img src={widgetAppearance?.widgetAppearance?.botLogo}></img>
        </div> */}
        <div className="flex flex-col w-3/5 place-items-start gap-y-1">
          <h5 className='justify-start w-full text-base break-all truncate text-start font-base justify-self-start'>{`${lastMessage?.content}`}</h5>
          <div className="flex text-xs text-neutral-400 gap-x-1 ">
            <CustomerMessageTimeLabel conversationItem={conversationItem} />
          </div>
        </div>
        <BiSend className="text-2xl shrink-0 justify-self-end justify-right " />
      </div>
    </button>
  )
}