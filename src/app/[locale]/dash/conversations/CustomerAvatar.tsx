import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

import { RandomBackground } from '../../(chat-widget)/DynamicBackground';

// import { faker } from '@faker-js/faker';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
}

export const CustomerAvatar: React.FC<Props> = ({ conversationItem, message }) => {
  return (
    <div className={`background avatar w-8 h-8  rounded-full p-2 ring-2 ring-primary ${message?.sender === 'operator' && conversationItem?.conversation.operator.online ? 'online' : 'offline'}`}>
      <RandomBackground customerId={conversationItem?.conversation?.customer?.customerId ?? ''} />
      {/* Gets initials of first two words in name */}
      {conversationItem?.conversation?.customer?.name ? `${conversationItem?.conversation.customer.name?.split(' ')?.[0]?.[0]} ${conversationItem?.conversation.customer.name?.split(' ')?.[1]?.[0]}` : conversationItem?.conversation?.customer?.customerId.slice(0, 2)}
    </div>

  )
}