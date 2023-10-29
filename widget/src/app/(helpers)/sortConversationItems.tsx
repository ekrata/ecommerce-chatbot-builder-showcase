import { useCallback } from 'react';

import { ConversationItem } from '@/entities/conversation';

export /**
 * sorts conversations by last message in place 
 * @date 23/06/2023 - 14:59:27
 *
 * @param {ConversationItem[]} conversationItems
 */
  const sortConversationItems = (conversationItems: ConversationItem[]) => {
    // sort messages
    conversationItems.forEach((conversationItem) => {
      conversationItem.messages?.sort((a, b) => a?.createdAt ?? 0 - (b?.createdAt ?? 0))
    });

    // sort conversations by comparing last message sentAt
    conversationItems.sort((a, b) => a?.messages?.slice(-1)?.[0]?.createdAt ?? 0 - (a?.messages?.slice(-1)[0]?.createdAt ?? 0)).reverse()
  }
