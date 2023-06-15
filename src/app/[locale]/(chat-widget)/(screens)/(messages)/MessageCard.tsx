'use-client'

import { EntityItem } from "electrodb";
import { useChatWidgetStore } from "../../(actions)/useChatWidgetStore";
import { Conversation } from "@/entities/conversation";
import { useFormatter, useTranslations } from "next-intl";
import { ConversationItem } from "../../(actions)/types";
import { BiChevronRight } from "react-icons/bi";
import { ConversationsContext } from "./MessagesScreen";
import { useContext } from "react";

interface Props {
  conversation: ConversationItem
}

/**
 * Renders the most recent message from a conversation. 
 * @date 14/06/2023 - 21:27:34
 *
 * @param {{ conversation: ConversationItem }} {conversation}
 * @returns {*}
 */
export const MessageCard: React.FC<Props> = ({conversation}) => {
  const {chatWidget: loading} = useChatWidgetStore()
  const [_, setConversationsState] = useContext(ConversationsContext)
  const t = useTranslations('chat-widget');
  const {relativeTime} = useFormatter()
  return (
    <>
      {loading && (
        <div className="flex items-center mt-4 space-x-3 animate-pulse">
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
      {conversation && !loading && (
      <button className="animate-fade-left" onClick={() => setConversationsState?.({selectedConversationId: conversation.conversation.conversationId})}>
        <h5>{t('Recent message')}</h5>
        <div className="flex place-items-center">
          <div className="avatar">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={`${
                  conversation?.operator?.profilePicture ??
                  'https://img.icons8.com/?size=512&id=7819&format=png'
                }`}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <p>{conversation?.messages?.slice(-1)[0].content}</p>
            <div className="flex text-neutral">
              <p>{conversation.operator?.name}</p>
              <p>
                {relativeTime(
                  conversation?.messages?.slice(-1)[0]?.sentAt ?? 0
                )}
              </p>
            </div>
          </div>
          <div>
            <BiChevronRight />
          </div>
        </div>
      </button>
      )}
    </>
    );
  }