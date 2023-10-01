import { getCookie } from 'cookies-next';
import { startCase } from 'lodash';
import { useTranslations } from 'next-intl';
// import FbMessengerIcon from 'public/brands/FbMessengerIcon.svg';
// import InstagramIcon from 'public/brands/InstagramIcon.svg';
// import WhatsappIcon from 'public/brands/WhatsappIcon.svg';
import { ReactNode, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FcFeedback, FcShop } from 'react-icons/fc';
import { GrChannel, GrMultiple } from 'react-icons/gr';

import { ConversationChannel, ConversationTopic, conversationTopic } from '@/entities/conversation';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../(hooks)/AuthProvider';

export const channelIconMap: Record<ConversationChannel, ReactNode | HTMLImageElement> = {
  'website': <FcShop className='text-2xl' />,
  'emailTicket': <FcFeedback className='text-2xl' />,
  'messenger': <img src="/brands/FbMessengericon.svg" className='h-6 object - fill w- 6' alt="Fb messenger" />,
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

  return (
    <details className={`w-full h-full dropdown ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row px-2 normal-case flex-nowrap gap-x-1 place-items-center text-normal btn btn-ghost">
        {channel ? <div className='object-fill text-2xl'>
          <>
            {channel}
          </>
        </div> : <GrMultiple className='text-2xl' />}
        <FaChevronDown className='' />
      </summary>
      <ul className="p-2 font-sans shadow menu font-normal dropdown-content z-[1] bg-base-100 text-sm rounded-box w-52 overflow-y-clip max-w-screen animate-fade-left">
        {Object.entries(channelIconMap)?.map(([key, icon], i) => (
          <li key={key} className='flex flex-row justify-start normal-case place-items-center' >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>
              <input type="radio" name={`radio-${key}`} className="form-control radio-primary radio-xs" defaultChecked={key === channel} onClick={() => {
                if (key === channel) {
                  setConversationListFilter({ ...conversationListFilter, channel: channel })
                } else {
                  setConversationListFilter({ ...conversationListFilter, channel: channel })
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