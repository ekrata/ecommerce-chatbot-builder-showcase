import { ConversationItem } from '../../../../../../../stacks/entities/conversation';

export const getItem = (
  ConversationItem: ConversationItem[],
  conversationId: string,
) =>
  ConversationItem.find(
    (conversationItem) => conversationItem?.conversationId === conversationId,
  );
