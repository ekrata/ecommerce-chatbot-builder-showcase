import { useTranslations } from 'next-intl';
import { FC, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { useForm } from 'react-hook-form';
import { BiChevronRight, BiSend } from 'react-icons/bi';
import { BsPersonCircle, BsX } from 'react-icons/bs';
import { useCreateConversationMut } from 'src/app/(actions)/mutations/useCreateConversationMut';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import {
    useConversationItemsByCustomerQuery
} from 'src/app/(actions)/queries/useConversationItemsQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from 'src/app/(helpers)/DynamicBackground';
import { MinimiseMobileButton } from 'src/app/MinimiseMobileButton';
import { v4 as uuidv4 } from 'uuid';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { sortConversationItems } from '../../(helpers)/sortConversationItems';
import { CustomerConversationCard } from './CustomerConversationCard';

type Inputs = {
  msg: string;
};

const fetchingConversationItemsSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
    {[...Array(10)].map(() => (
      <div className="flex w-full place-items-center animate-fade-left">
        <div className='flex flex-col w-full gap-y-2'>
          <BsPersonCircle className="w-12 text-gray-200 dark:text-gray-700"></BsPersonCircle>
          <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
      </div>))}
  </div>
)

export const ConversationsScreen: FC = () => {
  const { chatWidget: { setWidgetState, setSelectedConversationId, setWidgetVisibility } } = useChatWidgetStore(); const t = useTranslations('chat-widget');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const org = useOrgQuery();
  const orgId = org?.data?.orgId ?? ''
  const configuration = useConfigurationQuery(orgId);
  const widgetAppearance = { ...configuration.data?.channels?.liveChat?.appearance }
  // const createCustomerMut = useCreateCustomerMut(orgId, uuidv4());
  const customer = useCustomerQuery(orgId)

  const createConversationMut = useCreateConversationMut(orgId);
  const conversationItems = useConversationItemsByCustomerQuery(orgId, customer.data?.customerId ?? '')
  const noData = (
    <div className='flex flex-col justify-center h-screen place-items-center gap-y-1'>
      <h5 className='flex font-semibold'>{t('Messages', { count: 0 })}</h5>
    </div>
  )

  console.log(conversationItems.data)
  sortConversationItems(conversationItems.data ?? [])
  console.log(conversationItems.data)
  const render = useMemo(() => {
    return (
      <div className="flex justify-between w-full h-full rounded-3xl">
        <div className="flex flex-col w-full h-full place-items-center">
          <div
            className={`background text-white flex place-items-center w-full animated-flip-up justify-center rounded-t-lg text-xl font-semibold p-2 px-6 gap-x-2   `}
          >
            <MinimiseMobileButton />
            {configuration.data && <DynamicBackground configuration={configuration.data as any} />}
            {t('Messages')}
          </div>
          <div
            className={`flex flex-col place-items-center w-full overflow-y-scroll `}
          >
            {conversationItems.isFetching && fetchingConversationItemsSkeleton}
            {conversationItems.isSuccess && conversationItems.data.map((conversationItem) => (
              // conversationItem?.messages?.length &&
              <div key={conversationItem?.conversationId} data-testid={conversationItem?.conversationId} className="w-full border-b-2 divide-y-2">
                <CustomerConversationCard height={'16'} conversationItem={conversationItem} />
              </div>
            ))}
            {/* {(conversationItems.isSuccess && !conversationItems.data.length &&
              noData
            )} */}

          </div>
          <button onClick={async () => {
            const conversationId = uuidv4()
            setSelectedConversationId(conversationId);
            const res = await createConversationMut.mutateAsync([orgId ?? '', conversationId, { orgId, customerId: customer?.data?.customerId, operatorId: '', channel: 'website', status: 'unassigned' }])
          }}
            className="fixed z-10 justify-center normal-case border-0 shadow-lg btn gap-x-2 background rounded-3xl bottom-20">{t('Send us a message')}
            {configuration.data && <DynamicBackground configuration={configuration.data as any} />}
            <BiSend className='text-xl' />
          </button>
        </div>
      </div>
    );
  }, [conversationItems?.dataUpdatedAt, conversationItems?.data]
  )
  return render
};
