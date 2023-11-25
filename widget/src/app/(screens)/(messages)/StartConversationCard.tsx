'use-client'

import { EntityItem } from 'electrodb';
import { useFormatter, useTranslations } from 'next-intl';
import { BiSend } from 'react-icons/bi';
import { useCreateConversationMut } from 'src/app/(actions)/mutations/useCreateConversationMut';
import { useCreateCustomerMut } from 'src/app/(actions)/mutations/useCreateCustomerMut';
import { useConfigurationQuery } from 'src/app/(actions)/queries/useConfigurationQuery';
import { useCustomerQuery } from 'src/app/(actions)/queries/useCustomerQuery';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from 'src/app/(helpers)/DynamicBackground';
import { v4 as uuidv4 } from 'uuid';

import { Configuration } from '@/entities/configuration';

import { useChatWidgetStore } from '../../(actions)/useChatWidgetStore';

/**
 * Renders a button in place to present the opportunity for a user to start a new conversation. 
 * @date 14/06/2023 - 21:27:34
 *
 * @returns {*}
 */
export const StartConversationCard: React.FC = () => {
  const { chatWidget: { setWidgetState, setSelectedConversationId } } = useChatWidgetStore()
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
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
    const conversationId = uuidv4()
    setSelectedConversationId(conversationId);
    // await createCustomerMut.mutateAsync([orgId, '', { customerId, orgId }])
    await createConversationMut.mutateAsync([orgId ?? '', conversationId, { orgId, customerId: customer?.data?.customerId, channel: 'website', status: 'unassigned', operatorId: '' }])
    setWidgetState('conversations')
  }

  const averageWaitTime = org?.data?.averageUnassignedWaitTime?.slice(-1)?.[0]?.averageWaitTime

  const averageWaitTimeElement = (<div className="flex text-xs font-thin gap-x-1 ">
    <p>{`${t('We typically reply in under')} `}</p>
    <p className="">
      {averageWaitTime != null && `${relativeTime(averageWaitTime,
        Date.now()
      ).split(' ago')[0]}`}
    </p>
  </div>)
  return (
    <button className="justify-between block w-full h-20 p-2 py-4 text-sm font-light text-black normal-case bg-white rounded-md select-none hover:bg-gray-300 btn btn-ghost place-items-center animate-fade-left animate-once " onClick={async () => await onClick()} >
      <div className="flex justify-around place-items-center">
        <div className="w-12 h-12 p-2 rounded-full avatar background ring-1 ring-white online">
          {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
          <img src={widgetAppearance?.botLogo}></img>
        </div>
        <div className="flex flex-col place-items-start gap-y-1 ">
          <h5 className='justify-start text-sm font-semibold justify-self-start '>{t('Send us a message')}</h5>
          {averageWaitTime ? averageWaitTimeElement :
            <div className="flex text-xs font-thin gap-x-1 ">
              {t("answerQuestions")}
            </div>

          }
        </div>
        <BiSend className="ml-1 text-2xl justify-self-end justify-right " />
      </div>
    </button>
  )
}