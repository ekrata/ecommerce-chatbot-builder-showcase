'use client'
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FC, ReactNode, useState } from 'react';
import { ChangeHandler, SubmitHandler, useForm } from 'react-hook-form';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsX } from 'react-icons/bs';
import { CgSpinner } from 'react-icons/cg';
import { FcSearch } from 'react-icons/fc';
import { useDebounce } from 'usehooks-ts';
import { z } from 'zod';

import { useDashStore } from '../(actions)/useDashStore';
import { highlightMatches } from '../../../(helpers)/highlightMatches';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import {
  useSearchConversationItemsQuery
} from '../../../(hooks)/queries/useSearchConversationItemsQuery';
import {
  ConversationItemSearchKey, conversationItemSearchKey, ConversationItemSearchRes
} from '../../../../../../stacks/entities/conversation';
import { ChannelSelect } from './ChannelSelect';
import { CustomerAvatar } from './CustomerAvatar';
import { OperatorConversationCard } from './OperatorConversationCard';
import { OperatorSelect } from './OperatorSelect';
import { StatusSelect } from './StatusSelect';
import { TopicSelect } from './TopicSelect';

const schema = z.object({
  phrase: z.string().email().min(3, { message: 'Atleast 3 characters required.' }),
})

type FormValues = z.infer<typeof schema>

const fetchingSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
    {[...Array(10)].map(() => (
      <div className="flex w-full place-items-center animate-fade-left">
        <div className='flex flex-col w-full gap-y-2'>
          <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
      </div>))}
  </div>
)



export const ConversationsSearchView: FC = () => {
  const tCw = useTranslations('chat-widget');
  const t = useTranslations('dash');
  const { conversationListFilter: { topic, status, operatorId, channel }, setConversationState } = useDashStore();
  const [operatorSession] = useAuthContext();
  const [phrase, setPhrase] = useState('');
  const debouncedSearchPhrase = useDebounce(phrase, 2000);
  const searchConversationItemsQuery = useSearchConversationItemsQuery({ expansionFields: ['customerId', 'operatorId'], cursor: undefined, orgId: operatorSession?.orgId ?? '', operatorId: operatorId, channel: channel, topic: topic, phrase: debouncedSearchPhrase })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onBlur'
  });
  const onSubmit: SubmitHandler<FormValues> = (data) => setPhrase(data.phrase);
  const handleChange: ChangeHandler = async (event) => {
    setPhrase(event?.target?.value as string);
  }
  const listSearchMatches = (responses: ConversationItemSearchRes[]) => {
    return (
      <ul className="w-full mb-10 animate-fade-left">
        {responses?.map((response) => {
          if (!response.matches) {
            return <></>
          }
          const matchKeys = response?.matches?.map((match => match.key))
          const matches: Record<ConversationItemSearchKey, { indices: [number, number][], key: string, value: string, refIndex?: number } | undefined> = {}
          console.log(matches)
          const highlightedFields: Record<ConversationItemSearchKey, ReactNode[] | undefined> = {}

          conversationItemSearchKey.map((key) => {
            matches[key] = response?.matches?.find((matchedField => matchedField.key === key))
          })

          Object.entries(matches)?.map(([key, value]) => {
            highlightedFields[key] = matchKeys.includes(key) && matches[key]?.indices.length ? highlightMatches(matches[key]?.value ?? '', matches[key]?.indices) : undefined
            // console.log(highlightedField[key])
          })


          // const category = matchKeys.includes('category') && categoryIndicies?.length ? highlightMatches(response.item.category, categoryIndicies ) : ''
          // const subtitle = response.item?.subtitle && contentIndicies && matchKeys.includes('subtitle') ? highlightMatches(response.item?.subtitle, subtitleIndicies) : ''
          // const content = matchKeys.includes('content') && highlightMatches(response.item.content, contentIndicies)
          console.log(highlightedFields['customer.email'])
          return (
            <OperatorConversationCard height='16' conversationItem={response?.item} highlightedFields={highlightedFields} />
            // <Link
            //   href={{
            //     pathname: '/dash/conversations',
            //     query: { conversationId: response.item.conversationId },
            //   }}
            //   passHref>
            //   <li key={response.refIndex} className={`flex  justify-between w-full ${highlightedField['conversation.messages']?.length ? 'h-28' : 'h-20'} font-light normal-case border-0 border-b-[1px] border-gray-300 rounded-none btn btn-ghost text-normal`}>
            //     <div className='flex flex-row justify-start w-5/6 gap-x-2 overflow-y-clip basis-3/4 place-items-start gap-y-1'>
            //       <CustomerAvatar conversationItem={response?.item} customer={response?.item?.customer}></CustomerAvatar>
            //       <h5 className={`justify-stretch text-start w-full  text-sm break-all truncate  justify-self-start `}>{highlightedField['messages.content'] ? highlightedField['messages.content'].map(child => (<>{child}</>)) : response.item.messages?.slice(-1)[0]?.content}</h5>
            //     </div>
            //     <div className="flex flex-col w-full place-items-start gap-y-1">
            //       <h5 className={`justify-stretch text-start w-full  text-sm break-all truncate  justify-self-start ${readMessages?.[readMessageId] || (lastMessage.sender === 'operator' && lastMessage?.operatorId === sessionOperator?.operatorId) ? 'font-normal text-neutral-700' : 'font-semibold'} `}>{`${lastMessage?.content}`}</h5>
            //       <div className="flex flex-grow w-full text-xs justify-stretch text-neutral-400 gap-x-1">
            //         <OperatorMessageTimeLabel conversationItem={conversationItem} />
            //         {/* {conversationItem?.topic && <div className='justify-end text-xs badge badge-sm'>{startCase(conversationItem?.topic)}</div>} */}
            //       </div>
            //     </div>
            //     <div className='flex flex-row justify-start w-5/6 gap-x-2 overflow-y-clip basis-3/4 place-items-start gap-y-1'>
            //       <h5 className='justify-start text-base text-start'>{highlightedField['customer.name'] ? highlightedField['customer.name'].map(child => (<>{child}</>)) : response.item.customer?.name}</h5>
            //       <h5 className='text-sm'>{highlightedField['customer.email'] ? highlightedField['customer.email'].map(child => (<>{child}</>)) : response.item.customer?.email}</h5>
            //     </div>

            //     {/* {highlightedField['messages.content'] && <p className='justify-start text-xs text-start text-neutral-400'>{highlightedField['messages.content'] ? highlightedField['messages.content'].map(child => (<>{child}</>)) : response.item.messages?.slice(-1)[0].content}</p>} */}
            //     {/* <BiChevronRight className="flex text-3xl basis-1/6 shrink-0 justify-right" /> */}
            //   </li>
            // </Link>
          )
        })
        }
      </ul >)
  };

  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'>{t('conversations', { count: 0 })}</h5>
      <p className='flex text-xs text-neutral-400'>{`${tCw('No results for')} `}<p className='ml-1 text-base-content'>{` '${phrase}'`}</p></p>
    </div>
  )

  console.log(searchConversationItemsQuery?.data)
  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white border-b-[1px] flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold p-3 gap-x-2   `}
        >

          <div className='flex justify-center w-full place-items-center'>
            <BiChevronLeft onClick={() => setConversationState('list')} role='button' className="justify-start text-4xl hover:cursor-pointer " />
            <form className="flex w-full text-black rounded-lg place-items-center join" onSubmit={handleSubmit(onSubmit)}>
              <input className="justify-between w-full font-normal normal-case bg-gray-200 border-0 rounded-lg input-bordered input-sm text-normal" placeholder='Search for help' {...register("phrase", { onChange: (e) => handleChange(e) })} />
              <div className='rounded-r-lg -ml-7'>
                {searchConversationItemsQuery.isFetching ?
                  <CgSpinner className="text-2xl animate-spin" />
                  : phrase.length > 2 ? <BsX onClick={() => setPhrase('')} /> : <FcSearch className='justify-end text-2xl ' />}
              </div>
            </form>
          </div>
          <div className='flex justify-end w-full place-items-center'>
            <div className='flex place-items-center'>
              <StatusSelect />
              <ChannelSelect />
              <TopicSelect dropdownPosition='end' />
            </div>
            <div className='flex justify-end place-items-center'>
              <OperatorSelect dropdownPosition='end' />
            </div>

          </div>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full bg-white h-screen  overflow-y-scroll  `}
        >
          {searchConversationItemsQuery.isFetching ? fetchingSkeleton :
            (searchConversationItemsQuery?.data?.length ? listSearchMatches(searchConversationItemsQuery.data) : noData)}
        </div>
      </div>
    </div>
  );
};
