import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { EntityItem } from 'electrodb';
import { Message, SenderType } from '@/entities/message';
import {  BsSearch } from 'react-icons/bs';
import { useForm } from 'react-hook-form';
import { DynamicBackground } from '../DynamicBackground';
import { useChatWidgetStore } from '../(actions)/useChatWidgetStore';
import { BiChevronRight } from 'react-icons/bi';
import { MessageCard } from './(messages)/MessageCard';

type Inputs = {
  msg: string;
};

export const HomeScreen: FC = () => {
  const { relativeTime } = useFormatter();
  const { chatWidget: {conversations, loading, customer, configuration} } =
    useChatWidgetStore();
  const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();



  /**
   * Finds a conversation id that contains the most recent message for display to the user.
   * @date 13/06/2023 - 16:46:01
   *
   * @type {*}
   */
  const recentConversation = useMemo(() => {
    let recentMessages: EntityItem<typeof Message>[] = [];
    Object.entries(conversations).map(([key,value]) => {
      value?.messages?.sort((a, b) => a?.sentAt ?? 0 - (b?.sentAt ?? 0))
      if(value?.messages?.length) {
        const latestMessage = value?.messages.slice(-1)[0]
        if(latestMessage) {
          recentMessages.push(latestMessage)
        }
      }
    })
    const id = recentMessages?.sort((a, b) => a?.sentAt ?? 0 - (b?.sentAt ?? 0)).pop()?.conversationId
    return id ? conversations[id] : undefined
  
  }, [conversations])


  console.log(recentConversation, loading)
  return (
    <>
      <div
        className={`background flex place-items-center justify-between p-2 px-6 gap-x-2 border-b-2 border-gray-300 dark:border-gray-700 shadow-2xl`}
      >
        <DynamicBackground></DynamicBackground> 
      </div>
      <div className="-mt-5 dark:bg-gray-800 rounded-lg shadow-md p-2 animate-fade-left">

      </div>
      <div className="-mt-5 dark:bg-gray-800 rounded-lg shadow-md p-2 animate-fade-left">
        {loading && (
          <div className="flex items-center mt-4 space-x-3 animate-pulse animate-fade-left">
              <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              </div>
              <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              </div>
              <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
              </div>
          </div>
        )}
        {recentConversation && !loading && (
          <div className="animate-fade-left">
              <div className="flex place-items-center">
              <div className="join">
                <div>
                  <div>
                    <input type="button" className="btn input input-bordered join-item" placeholder={t('search for help')}/>
                  </div>
                </div>
                <div className="join-item">
                  <BsSearch/>
                </div>
              </div>
                <MessageCard conversation={recentConversation}/>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
