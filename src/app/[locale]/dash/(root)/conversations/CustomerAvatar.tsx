import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Customer } from '@/entities/customer';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

import { RandomBackground } from '../../../(helpers)/DynamicBackground';
import { getInitials } from '../../../(helpers)/getInitials';

// import { faker } from '@faker-js/faker';

interface Props {
  conversationItem?: ConversationItem,
  customer?: EntityItem<typeof Customer>
  showTypingState?: boolean
}

export const CustomerAvatar: React.FC<Props> = ({ conversationItem, customer, showTypingState }) => {
  const message = conversationItem?.messages?.slice(-1)?.[0]
  console.log(customer)
  const avatarText = customer?.name ?? getInitials(customer?.name ?? '') ?? customer?.email?.slice(0, 3) ?? customer?.customerId?.slice(0, 3)
  console.log(avatarText)
  return (
    <div className={`background avatar placeholder w-8 h-8  rounded-full p-1 ring-2 ring-info ${message?.sender === 'operator' && customer?.online ? 'online' : 'offline'}`}>
      <div>

        {message && showTypingState &&
          <div className="indicator">
            <span
              data-testid="status-badge"
              className={`indicator-item  badge-success badge-xs text-white dark:text-default rounded-full ${!message?.sentAt
                ? 'mx-0 my-0 indicator-bottom animate-bounce'
                : 'my-2 mx-2 indicator-top'
                }`}
            >
              {!message?.sentAt ? '...' : ''}
            </span>

            {avatarText}
          </div >

        }
        <span className='overflow text-overflow'>
          {avatarText}

        </span>
        <RandomBackground customerId={conversationItem?.customer?.customerId ?? ''} />
        {/* Gets initials of first two words in name */}
      </div>
    </div>

  )
}