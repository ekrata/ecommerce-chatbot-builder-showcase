import { ConversationItem } from "@/entities/conversation";
import { useCallback } from "react";

export /**
 * sorts conversations by last message in place 
 * @date 23/06/2023 - 14:59:27
 *
 * @param {ConversationItem[]} conversationItems
 */
const sortConversationItems = (conversationItems: ConversationItem[]) => {
    // sort messages
    conversationItems.forEach((conversationItem) => {
      conversationItem.messages?.sort((a, b) => a?.sentAt ?? 0 - (b?.sentAt ?? 0))
    });

    // sort conversations by comparing last message sentAt
    conversationItems.sort((a,b) => a?.messages?.slice(-1)?.[0]?.sentAt ?? 0 - (a?.messages?.slice(-1)[0]?.sentAt ?? 0 )).reverse()
  }
