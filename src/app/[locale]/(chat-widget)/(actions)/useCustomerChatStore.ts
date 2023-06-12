import { EntityItem } from 'electrodb';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Conversation } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { Customer } from '@/entities/customer';
import { Org } from '@/entities/org';
import { Configuration } from '@/entities/configuration';
import { Visitor } from '@/entities/visitor';
import { Operator } from '@/entities/operator';
import { Translation } from '@/entities/translation';

export type WidgetState =
  | 'online'
  | 'closed'
  | 'help'
  | 'chat'
  | 'minimized'
  | 'messages'
  | 'home';

interface CustomerChatStoreState {
  org?: EntityItem<typeof Org>;
  visitor?: EntityItem<typeof Visitor>;
  customer?: EntityItem<typeof Customer>;
  operator?: EntityItem<typeof Operator>;
  conversation?: EntityItem<typeof Conversation>;
  messages?: EntityItem<typeof Message>[];
  configuration?: EntityItem<typeof Configuration>;
  widgetState: WidgetState;
}

export const useCustomerChatStore = create<CustomerChatStoreState>()(
  persist((set, get) => ({ widgetState: 'minimized' }), {
    name: 'customerChatStore', // unique name
    storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
  })
);
