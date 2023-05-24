import { EntityItem } from 'electrodb';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Conversation } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { Customer } from '@/entities/customer';
import { Api } from 'sst/node/api';
import { Org } from '@/entities/org';
import { Configuration } from '@/entities/configuration';
import { Visitor } from '@/entities/visitor';
import { createConversation, createVisitor } from '../actions';

interface ChatBoxState {
  org?: EntityItem<typeof Org>;
  visitor?: EntityItem<typeof Visitor>;
  customer?: EntityItem<typeof Customer>;
  conversation?: EntityItem<typeof Conversation>;
  messages?: EntityItem<typeof Message>[];
  configuration?: EntityItem<typeof Configuration>[];
}

interface ChatBoxActions {
  onInitialLoad: () => Promise<void>;
  onPageChange: () => Promise<void>;
  onConversationStart: () => Promise<void>;
}

export const useCustomerChatStore = create<ChatBoxState & ChatBoxActions>()(
  persist(
    (set, get) => ({
      onInitialLoad: async () => {
        set({
          ...state(),
          visitor: await createVisitor(get()?.org?.orgId ?? ''),
        });
      },
      onPageChange: async () => {},
      onConversationStart: async () => {
        const orgId = get()?.org?.orgId
        await createCustomer()
        await createConversation()
        set({
          ...state(),
          conversation: ,
        });
      },
      onTicketStart: async () => {
        const orgId = get()?.org?.orgId
        const  = get()?.org?.orgId
        await createConversation()
        set({
          ...state(),
          conversation: ,
        });
      },
    }),
    {
      name: 'chatbox-store', // unique name
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
