'use-client'
import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { useFormatter, useTranslations } from "next-intl";
import { useContext, useMemo } from "react";
import { EntityItem } from "electrodb";
import { useQuery } from "@tanstack/react-query";
import {BiSend} from 'react-icons/bi';
import { getConfiguration } from "../../(actions)/orgs/configurations/getConfiguration";
import { Configuration } from "@/entities/configuration";
import { DynamicBackground } from "../../DynamicBackground";
import { useConfigurationQuery, useConversationItemsQuery, useCustomerQuery, useOrgQuery } from "../../(hooks)/queries";
import { useCreateConversationMut } from "../../(hooks)/mutations";
import { ConversationsContext } from "../../ChatWidget";
import { MessageTimeLabel } from "./MessageTimeLabel";
import { getItem } from "../../(helpers)/helpers";
  
  interface Props {
    conversationId?: string 
    rounded?: boolean
    showRecentLabel?: boolean
  }
  
  /**
   * Renders a chat containing info about a conversation. Clicking on it creates a new conversation and redirects to the chat screen. 
   * @date 14/06/2023 - 21:27:34
   *
   * @returns {*}
   */
  export const ConversationCard: React.FC<Props> = ({conversationId, rounded = false, showRecentLabel}) => {
    const {chatWidget: {setWidgetState, setSelectedConversationId}} = useChatWidgetStore()
    const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
    const t = useTranslations('chat-widget');
    const customer = useCustomerQuery(orgId, '');
    const conversationItems = useConversationItemsQuery(orgId, customer?.data?.customerId ?? '')
    const conversationItem = getItem(conversationItems.data ?? [], conversationId ?? '');
    const configuration = useConfigurationQuery(orgId);
    const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
    const { relativeTime } = useFormatter()
    var halfAnHourAgo = new Date(Date.now())
    halfAnHourAgo.setMinutes ( halfAnHourAgo.getMinutes() - 30 );

    const lastMessage = useMemo(() => {
      return conversationItem?.messages?.slice(-1)[0]
    }, [conversationItem])


    return (
        <button className={`btn btn-ghost block ${rounded && 'rounded-3xl'} font-light justify-between h-[7rem]  normal-case place-items-center animate-fade-left w-full  text-sm`} 
        onClick={() => {
          setSelectedConversationId(conversationItem?.conversation.conversationId)
          setWidgetState('chat');
        }}> 
        {showRecentLabel && <div className="flex font-semibold pl-2 pb-2 mb-2">
          {t('Recent message')}
        </div>}
        {conversationItems?.fetchStatus !== 'idle' && conversationItems?.isLoading && (
        <div className="flex items-center mt-4 space-x-3 animate-pulse animate-fade-left">
          <svg
            className="text-gray-200 w-14 h-14 dark:text-gray-700"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div>
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
            <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
        </div>
        )}
        {conversationItems?.isSuccess && (
          <div className="flex place-items-center justify-around animate-fade-left">
            <div className="avatar shrink-0 w-12 h-12 background rounded-full p-2 ring-2 ring-primary online">
              {configuration.data && <DynamicBackground configuration={configuration.data}/>}
              <img src={widgetAppearance?.botLogo}></img>
            </div>
            <div className="flex flex-col place-items-start gap-y-1 w-3/5">
              <h5 className='font-base justify-start w-full text-base justify-self-start truncate break-all'>{`${lastMessage?.content}aasjdksahdjshadhjsdahdsjasahdjasdhsajhdjasnasdjnsamdansjsdanbjadsbsjadsdhjsdhajasd`}</h5>
              <div className="flex text-xs text-neutral-400 gap-x-1 ">
                <MessageTimeLabel conversationItem={conversationItem} message={conversationItem?.messages?.slice(-1)[0]}/>
              </div>
            </div>
            <BiSend className="text-2xl shrink-0 justify-self-end   justify-right "/>
          </div>
        )}
        </button>
        )
    }