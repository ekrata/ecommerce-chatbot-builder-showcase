import { EntityItem } from 'electrodb';
import { useMemo, useState } from 'react';

import { ConversationItem } from '@/entities/conversation';
import { avatarGradients, Customer } from '@/entities/customer';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

import { RandomBackground } from '../../../(helpers)/DynamicBackground';
import { getInitials } from '../../../(helpers)/getInitials';

interface Props {
  conversationItem?: ConversationItem,
  customer?: EntityItem<typeof Customer>
  showTypingState?: boolean
}

export const CustomerAvatar: React.FC<Props> = ({ conversationItem, customer, showTypingState }) => {
  const message = conversationItem?.messages?.slice(-1)?.[0]
  const avatarText = customer?.name ?? getInitials(customer?.name ?? '') ?? customer?.email?.slice(0, 2) ?? customer?.customerId?.slice(0, 2)
  const [color, setColor] = useState(faker.helpers.arrayElement(avatarGradients))

  return (
    <div className={` w-8 h-8 ${color} rounded-full p-1  ring-info ${message?.sender === 'operator' && customer?.online ? 'online' : 'offline'}`}>
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
            <span className='font-semibold overflow text-overflow place-items-center'>

              {avatarText}
            </span>
          </div >
        }
      </div >

      <span className='font-semibold text-black overflow text-overflow place-items-center'>
        {avatarText}

      </span>
    </div >

  )
}