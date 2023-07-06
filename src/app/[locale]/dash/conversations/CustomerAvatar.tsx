import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { faker } from '@faker-js/faker';

// import { faker } from '@faker-js/faker';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
}

export const colors = ['pink', 'indigo', 'red', 'purple', 'green', 'amber', 'yellow', 'lime', 'blue', 'cyan', 'orange']
export const getRandomColor = (customerId: string) => {
  faker.seed(parseInt(customerId.split('-')[0]))
  return faker.helpers.arrayElement(colors)
}

export const CustomerAvatar: React.FC<Props> = ({ conversationItem, message }) => {
  return (
    <div className={`avatar w-12 h-12 bg-${getRandomColor(conversationItem?.conversation.customerId ?? '')}-500 background rounded-full p-2 ring-2 ring-primary ${message?.sender === 'operator' && conversationItem?.conversation.operator.online ? 'online' : 'offline'}`}>
      {/* Gets initials of first two words in name */}
      {conversationItem?.conversation?.customer?.name ? `${conversationItem?.conversation.customer.name?.split(' ')?.[0]?.[0]} ${conversationItem?.conversation.customer.name?.split(' ')?.[1]?.[0]}` : conversationItem?.conversation?.customer?.customerId.slice(0, 2)}
    </div>

  )
}