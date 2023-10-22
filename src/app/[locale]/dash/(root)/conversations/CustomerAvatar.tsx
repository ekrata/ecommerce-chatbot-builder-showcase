import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

import { RandomBackground } from '../../../(helpers)/DynamicBackground';

// import { faker } from '@faker-js/faker';

interface Props {
  conversationItem?: ConversationItem,
  showTypingState?: boolean
}

export const CustomerAvatar: React.FC<Props> = ({ conversationItem, showTypingState }) => {
  const message = conversationItem?.messages?.slice(-1)?.[0]
  return (
    <div className={`background avatar w-8 h-8  rounded-full p-2 ring-2 ring-info ${message?.sender === 'operator' && conversationItem?.operator?.online ? 'online' : 'offline'}`}>
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
        </div >
      }
      <RandomBackground customerId={conversationItem?.customer?.customerId ?? ''} />
      {/* Gets initials of first two words in name */}
      {conversationItem?.customer?.name ? `${conversationItem?.customer.name?.split(' ')?.[0]?.[0]} ${conversationItem?.customer.name?.split(' ')?.[1]?.[0]}` : conversationItem?.customer?.customerId.slice(0, 2)}
    </div>

  )
}