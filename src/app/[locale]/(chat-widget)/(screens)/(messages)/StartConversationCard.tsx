'use-client'

import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { ConversationItem } from "@/entities/conversation";
import { useFormatter, useTranslations } from "next-intl";
import { ConversationsContext } from "./MessagesScreen";
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

interface Props {
  conversation?: ConversationItem
}

/**
 * Renders a button in place to present the opportunity for a user to start a new conversation. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const StartConversationCard: React.FC<Props> = () => {
  const {chatWidget: {setWidgetState}} = useChatWidgetStore()
  const orgId = process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''
  const [_, setConversationsState] = useContext(ConversationsContext)
  const t = useTranslations('chat-widget');
  const org = useQuery<EntityItem<typeof Org>>([orgId, 'org'], async () => getOrg(orgId ?? ''));
  const mutation = useMutation({
    mutationKey: [orgId, 'createConversation'],
    mutationFn: async(params: Parameters<typeof createConversation>) => await createConversation(...params)
    })
  const { relativeTime } = useFormatter()
  const configuration = useQuery<EntityItem<typeof Configuration>>([orgId, 'configuration'], async () => getConfiguration(process.env.NEXT_PUBLIC_AP_ORG_ID ?? ''));
  const { widgetAppearance } = {...configuration.data?.channels?.liveChat?.appearance}
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes ( halfAnHourAgo.getMinutes() - 30 );
  return (
      <button className="btn btn-ghost block font-light justify-between h-full normal-case place-items-center animate-fade-left w-full  p-1 py-4  text-sm " onClick={async() => {
        const conversationId = uuidv4()
        const res = await mutation.mutateAsync([orgId ?? '', conversationId, {orgId, type: 'chat', channel: 'website', status: 'unassigned' }])
        setConversationsState?.({selectedConversationId:  res.conversationId})
        setWidgetState('chat')
      }} > 
        <div className="flex place-items-center justify-around">
          <div className="avatar w-12 h-12 background rounded-full p-2 ring-2 ring-primary online">
            {configuration.data && <DynamicBackground configuration={configuration.data}/>}
            <img src={widgetAppearance?.botLogo}></img>
          </div>
          <div className="flex flex-col place-items-start  gap-y-1 ">
            <h5 className='font-semibold justify-start text-base justify-self-start '>{t('Send us a message')}</h5>
            <div className="flex text-xs dark:text-neutral-400 gap-x-1 ">
              <p>{`${t('We typically reply in under')} `}</p>
              <p className="">
                {` ${relativeTime(halfAnHourAgo,
                  Date.now()
                ).split(' ago')[0]}`}
              </p>
            </div>
          </div>
            <BiSend className="text-2xl justify-self-end ml-1 text-gray-400 justify-right "/>
        </div>
      </button>
      )
  }