import { EntityItem } from 'electrodb';

import {
  Conversation,
  ConversationItem,
  ExpandedConversation,
} from '../../../../../../../../../stacks/entities/conversation';
import { CreateConversation } from '../../../../../../../../../stacks/entities/entities';

export const createConversation = async (
  orgId: string,
  conversationId: string,
  body: CreateConversation,
): Promise<ConversationItem> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/conversations/${conversationId}`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  const conversation = await res.json();
  return {
    ...conversation,
    messages: [],
  };
};
