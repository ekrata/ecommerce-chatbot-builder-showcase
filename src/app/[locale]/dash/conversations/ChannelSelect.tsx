import { startCase } from 'lodash';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FcFeedback, FcShop } from 'react-icons/fc';
import { GrMultiple } from 'react-icons/gr';

import { ConversationChannel } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';

export const channelIconMap: Record<ConversationChannel | 'all', ReactNode | HTMLImageElement> = {
  'all': <GrMultiple className='text-2xl' />,
  'website': <FcShop className='text-2xl' />,
  'emailTicket': <FcFeedback className='text-2xl' />,
  'messenger': <img src="/brands/FbMessengericon.svg" className='object-fill w-6 h-6' alt="Fb messenger" />,
  'whatsapp': <img src="/brands/WhatsappIcon.svg" className='object-fill w-8 h-8' alt="Whatsapp" />,
  'instagram': <img src="/brands/InstagramIcon.svg" className='object-fill w-6 h-6' alt="Instagram" />
}


interface Props {
  dropdownPosition?: 'end'
}

export const ChannelSelect: React.FC<Props> = ({ dropdownPosition }) => {
  const t = useTranslations('dash');
  const [sessionOperator] = useAuthContext();
  const { setConversationListFilter, conversationListFilter } = useDashStore()
  const { channel } = conversationListFilter

  console.log(channel)
  return (
    <details className={`w-full h-full dropdown ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row px-2 normal-case flex-nowrap gap-x-1 place-items-center text-normal btn btn-ghost">
        {channel ? <div className=''>
          <>
            {channelIconMap?.[channel]}
          </>
        </div> : <GrMultiple className='text-2xl' />}
        <FaChevronDown className='' />
      </summary>
      <ul className="font-sans shadow menu font-normal dropdown-content z-[1] bg-base-100 text-sm rounded-box w-52 overflow-y-clip max-w-screen animate-fade-left">
        <p className='border-b-[1px] justify-center text-center bg-black text-white'>{t('Channel')}</p>
        {Object.entries(channelIconMap)?.map(([key, icon], i) => (
          <li key={key} className='flex flex-row justify-start normal-case place-items-center' >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>
              <input type="radio" name={`radio-channel`} className="form-control radio-primary radio-xs" defaultChecked={channel === key || (channel === undefined && key === 'all')} onClick={() => {
                if (key === 'all') {
                  setConversationListFilter({ ...conversationListFilter, channel: undefined })
                } else {
                  console.log(channel)
                  setConversationListFilter({ ...conversationListFilter, channel: key as ConversationChannel })
                }
              }} />
              <div className='flex text-sm place-items-center gap-x-2'>
                <div className='text-xl'>
                  <>
                    {icon}
                  </>
                </div>
                {startCase(key)}
              </div>
            </a>

          </li>
        ))}
      </ul>
    </details>
  )
}