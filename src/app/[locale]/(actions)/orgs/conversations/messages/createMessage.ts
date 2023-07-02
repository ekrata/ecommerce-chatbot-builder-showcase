import { CreateMessage } from '@/entities/entities';
import { Message } from '@/entities/message';
import { EntityItem } from 'electrodb';

export const createMessage = async (
  orgId: string,
  conversationId: string,
  messageId: string,
  body: CreateMessage
): Promise<EntityItem<typeof Message>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}/messages/${messageId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
