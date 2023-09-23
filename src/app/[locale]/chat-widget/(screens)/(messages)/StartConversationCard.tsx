'use-client'

import { useFormatter, useTranslations } from 'next-intl';
import { BiSend } from 'react-icons/bi';
import { v4 as uuidv4 } from 'uuid';

import {
  useCreateConversationMut
} from '@/app/[locale]/(hooks)/mutations/useCreateConversationMut';
import { useCreateCustomerMut } from '@/app/[locale]/(hooks)/mutations/useCreateCustomerMut';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';
import { DynamicBackground } from '../../../(helpers)/DynamicBackground';
import { useConfigurationQuery } from '../../../(hooks)/queries';
import { useCustomerQuery } from '../../../(hooks)/queries/useCustomerQuery';

/**
 * Renders a button in place to present the opportunity for a user to start a new conversation. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const StartConversationCard: React.FC = () => {
  const { chatWidget: { setWidgetState, setSelectedConversationId } } = useChatWidgetStore()
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const t = useTranslations('chat-widget');
  const customer = useCustomerQuery(orgId);
  const createConversationMut = useCreateConversationMut(orgId);
  const newCustomerId = uuidv4()
  const createCustomerMut = useCreateCustomerMut(orgId, newCustomerId);
  const { relativeTime } = useFormatter()
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  var halfAnHourAgo = new Date(Date.now())
  halfAnHourAgo.setMinutes(halfAnHourAgo.getMinutes() - 30);

  const onClick = async () => {
    setWidgetState('conversations')
    const conversationId = uuidv4()
    setSelectedConversationId(conversationId);
    await createCustomerMut.mutateAsync([orgId, '', false])
    await createConversationMut.mutateAsync([orgId ?? '', conversationId, { orgId, customerId: customer?.data?.customerId, channel: 'website', status: 'unassigned' }])
  }

  return (
    <button className="justify-between block w-full h-20 p-2 py-4 text-sm font-light normal-case btn btn-ghost rounded-3xl text-base-100 place-items-center animate-fade-left animate-once " onClick={async () => await onClick()} >
      <div className="flex justify-around place-items-center">
        <div className="w-12 h-12 p-2 rounded-full avatar background ring-2 ring-primary online">
          {configuration.data && <DynamicBackground configuration={configuration.data} />}
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
        <BiSend className="ml-1 text-2xl justify-self-end animate-pulse animate-infinite justify-right " />
      </div>
    </button>
  )
}