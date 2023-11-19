'use client'
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BiChevronDown, BiChevronUp, BiMailSend } from 'react-icons/bi';
import {
    BsArrowDown, BsArrowUp, BsChat, BsChatSquare, BsChevronUp, BsClock, BsEmojiSmile, BsPerson,
    BsReverseLayoutSidebarInsetReverse, BsTranslate
} from 'react-icons/bs';
import { FaMoneyBill } from 'react-icons/fa';
import { GiPaintBrush } from 'react-icons/gi';

const appearanceLink = '/dash/settings/channels/live-chat/appearance'
const installationLink = '/dash/settings/channels/live-chat/installations'
const translationsLink = '/dash/settings/channels/live-chat/translations'
const ticketingLink = '/dash/settings/channels/ticketing'
const facebookMessengerLink = '/dash/settings/channels/facebook-messenger'
const instagramLink = '/dash/settings/channels/instagram'
const accountLink = '/dash/settings/personal/account'
const operatingHoursLink = '/dash/settings/personal/operating-hours'
const customerSatisfactionLink = '/dash/settings/general/customer-satisfaction'
const projectBillingLink = '/dash/settings/general/project-billing'


export const SettingsMenu: React.FC = () => {
  const t = useTranslations('dash.settings')
  const path = usePathname()
  const [liveChatClosed, setLiveChatClosed] = useState<boolean>(false)

  return (
    < ul className="bg-white menu " >
      <li className='text-gray-600 border-b-2'>{t('Channels')}</li>
      <details onClick={() => setLiveChatClosed(!liveChatClosed)} open={true}>
        <summary className='flex justify-between py-2 pl-4 border-b-2 gap-x-2 place-items-center'>
          <>
            <BsChatSquare />{t('Live Chat')}
          </>
          {!liveChatClosed ? <BiChevronDown /> : <BiChevronUp />}</summary>
        <ul className='pl-2 border-b-2'>
          <li><Link className={`${path?.includes(appearanceLink) && 'active'}`} href={{ pathname: appearanceLink }}><GiPaintBrush />{t('appearance.Appearance')}</Link></li>
          <li><Link className={`${path?.includes(installationLink) && 'active'}`} href={{ pathname: installationLink }} > <BsReverseLayoutSidebarInsetReverse />{t('installation.Installation')}</Link></li>
          {/* <li><Link className={`${path?.includes(translationsLink) && 'active'}`} href={{ pathname: translationsLink }}><BsTranslate />{t('Translations')}</Link></li> */}
        </ul>
      </details>
      {/* <li><Link className={`${path?.includes(ticketingLink) && 'active'}`} href={{ pathname: ticketingLink }}><BiMailSend />{t('Ticketing.Ticketing')}</Link></li> */}
      {/* <li><Link className={`${path?.includes(facebookMessengerLink) && 'active'}`} href={{ pathname: facebookMessengerLink }}><BiMailSend />Facebook Messenger</Link></li> */}
      {/* <li><Link className={`${path?.includes(instagramLink) && 'active'}`} href={{ pathname: instagramLink }}><BiMailSend />Instagram</Link></li> */}
      <li className='text-gray-600 border-b-2'>{t('Personal')}</li>
      <li><Link className={`${path?.includes(accountLink) && 'active'}`} href={{ pathname: accountLink }}><BsPerson />{t('Account.Account')}</Link></li>
      {/* <li><Link className={`${path?.includes(operatingHoursLink) && 'active'}`} href={{ pathname: operatingHoursLink }}><BsClock />{t('operatingHours.Operating Hours')}</Link></li> */}
      <li className='text-gray-600 border-b-2'>{t('General')}</li>
      {/* <li><Link className={`${path?.includes(customerSatisfactionLink) && 'active'}`} href={{ pathname: customerSatisfactionLink }}><BsEmojiSmile />{t('customerSatisfaction.Customer satisfaction')}</Link></li> */}
      <li><Link className={`${path?.includes(projectBillingLink) && 'active'}`} href={{ pathname: projectBillingLink }}><FaMoneyBill />{t('Project & Billing')}</Link></li>
    </ul >
  )
}