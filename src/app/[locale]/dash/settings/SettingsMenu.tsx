import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiMailSend } from 'react-icons/bi';
import {
    BsChat, BsChatSquare, BsClock, BsEmojiSmile, BsPerson, BsReverseLayoutSidebarInsetReverse,
    BsTranslate
} from 'react-icons/bs';
import { FaMoneyBill } from 'react-icons/fa';
import { GiPaintBrush } from 'react-icons/gi';

const appearanceLink = 'settings/channels/live-chat/appearance'
const installationLink = 'settings/channels/live-chat/installation'
const translationsLink = 'settings/channels/live-chat/translations'
const ticketingLink = 'settings/channels/ticketing'
const facebookMessengerLink = 'settings/channels/facebook-messenger'
const instagramLink = 'settings/channels/facebook-messenger'
const accountLink = 'settings/personal/account'
const operatingHoursLink = 'settings/personal/operating-hours'
const customerSatisfactionLink = 'settings/general/customer-satisfaction'
const projectBillingLink = 'settings/general/project-billing'


export const SettingsMenu: React.FC = () => {
  const t = useTranslations('dash.settings')
  const path = usePathname()

  return (
    < ul className="bg-white menu " >
      <li className='text-gray-600 border-b-2'>{t('Channels')}</li>
      <li>
        <details open>
          <summary className='flex gap-x-2 place-items-center'><BsChatSquare />{t('Live Chat')}</summary>
          <ul>
            <li><Link className={`${path?.includes(appearanceLink) && 'active'}`} href={{ pathname: appearanceLink }}><GiPaintBrush />{t('appearance.Appearance')}</Link></li>
            <li><Link className={`${path?.includes(installationLink) && 'active'}`} href={{ pathname: installationLink }} > <BsReverseLayoutSidebarInsetReverse />{t('installation.Installation')}</Link></li>
            <li><Link className={`${path?.includes(translationsLink) && 'active'}`} href={{ pathname: translationsLink }}><BsTranslate />{t('Translations')}</Link></li>
          </ul>
        </details>
      </li>
      <li><Link className={`${path?.includes(ticketingLink) && 'active'}`} href={{ pathname: ticketingLink }}><BiMailSend />{t('Ticketing.Ticketing')}</Link></li>
      <li><Link className={`${path?.includes(facebookMessengerLink) && 'active'}`} href={{ pathname: facebookMessengerLink }}><BiMailSend />Facebook Messenger</Link></li>
      <li><Link className={`${path?.includes(instagramLink) && 'active'}`} href={{ pathname: instagramLink }}><BiMailSend />Instagram</Link></li>
      <li className='text-gray-600 border-b-2'>{t('Personal')}</li>
      <li><Link className={`${path?.includes(accountLink) && 'active'}`} href={{ pathname: accountLink }}><BsPerson />{t('Account.Account')}</Link></li>
      <li><Link className={`${path?.includes(operatingHoursLink) && 'active'}`} href={{ pathname: operatingHoursLink }}><BsClock />{t('operatingHours.Operating Hours')}</Link></li>
      <li className='text-gray-600 border-b-2'>{t('General')}</li>
      <li><Link className={`${path?.includes(customerSatisfactionLink) && 'active'}`} href={{ pathname: customerSatisfactionLink }}><BsEmojiSmile />{t('customerSatisfaction.Customer satisfaction')}</Link></li>
      <li><Link className={`${path?.includes(projectBillingLink) && 'active'}`} href={{ pathname: projectBillingLink }}><FaMoneyBill />{t('Project & Billing')}</Link></li>
    </ul >
  )
}