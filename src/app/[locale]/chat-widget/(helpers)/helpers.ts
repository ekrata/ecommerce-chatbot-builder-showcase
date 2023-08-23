import { ConversationItem } from '@/entities/conversation';

export const getItem = (
  ConversationItem: ConversationItem[],
  conversationId: string
) =>
  ConversationItem.find(
    (conversationItem) =>
      conversationItem.conversation.conversationId === conversationId
  );
