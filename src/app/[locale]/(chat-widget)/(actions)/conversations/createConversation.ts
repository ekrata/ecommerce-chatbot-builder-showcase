import { Conversation } from '@/entities/conversation';
import { CreateConversation } from '@/entities/entities';
import { EntityItem } from 'electrodb';

export const createConversation = async (
  orgId: string,
  conversationId: string,
  body: CreateConversation
): Promise<EntityItem<typeof Conversation>> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
