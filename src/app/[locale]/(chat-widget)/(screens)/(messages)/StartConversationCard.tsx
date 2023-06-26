'use-client'

import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { ConversationItem } from "@/entities/conversation";
import { useFormatter, useTranslations } from "next-intl";
import { useContext } from "react";
import { EntityItem } from "electrodb";
import { getOrg } from "../../(actions)/orgs/getOrg";
import { Org } from "@/entities/org";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BsPencilSquare } from "react-icons/bs";
import { v4 as uuidv4} from 'uuid'
import { createConversation } from "../../(actions)/conversations/createConversation";
import {BiSend, BiUserCircle} from 'react-icons/bi';
import { getConfiguration } from "../../(actions)/orgs/configurations/getConfiguration";
import { Configuration } from "@/entities/configuration";
import { DynamicBackground } from "../../DynamicBackground";
import { useCreateConversationMut } from "../../(hooks)/mutations";
import { useConfigurationQuery, useCustomerQuery } from "../../(hooks)/queries";

/**
 * Renders a button in place to present the opportunity for a user to start a new conversation. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const StartConversationCard: React.FC = () => {
  const {chatWidget: {setWidgetState, setSelectedConversationId}} = useChatWidgetStore()
  const orgId = process.env.NEXT_PUBLIC_CW_ORG_ID ?? ''
  const t = useTranslations('chat-widget');
  const customer = useCustomerQuery(orgId, '');
  const createConversationMut = useCreateConversationMut(orgId, customer.data?.customerId ?? '');
  const { relativeTime } = useFormatter()
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes ( halfAnHourAgo.getMinutes() - 30 );
  return (
      <button className="justify-between block w-full h-20 p-2 py-4 text-sm font-light normal-case btn btn-ghost animate-ping rounded-3xl text-base-100 place-items-center animate-fade-left animate-once " onClick={async() => {
        setWidgetState('chat')
        const conversationId = uuidv4()
        setSelectedConversationId(conversationId);
        const res = await createConversationMut.mutateAsync([orgId ?? '', conversationId, {orgId, type: 'botChat', channel: 'website', status: 'unassigned' }])
      }} > 
        <div className="flex justify-around place-items-center">
          <div className="w-12 h-12 p-2 rounded-full avatar background ring-2 ring-primary online">
            {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            <img src={widgetAppearance?.botLogo}></img>
          </div>
          <div className="flex flex-col place-items-start gap-y-1 ">
            <h5 className='justify-start text-base font-semibold justify-self-start '>{t('Send us a message')}</h5>
            <div className="flex text-xs dark:text-neutral-400 gap-x-1 ">
              <p>{`${t('We typically reply in under')} `}</p>
              <p className="">
                {` ${relativeTime(halfAnHourAgo,
                  Date.now()
                ).split(' ago')[0]}`}
              </p>
            </div>
          </div>
            <BiSend className="ml-1 text-2xl justify-self-end animate-pulse animate-infinite justify-right "/>
        </div>
      </button>
      )
  }