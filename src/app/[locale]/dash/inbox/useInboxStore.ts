import { createStore } from "zustand"
import { immer } from "zustand/middleware/immer"

// interface Message {
//   author: 'customer' | 'user'
//   content: string
// }
// interface State {
//   currentChatId?: string
//   unassignedChats: string
//   openChats: string

// }

// type Actions = {
//   setCurrentChatId: (chatId: string) => void
//   resolveChat: (chatId: string) => Promise<void>
//   assignChat: (chatId: string, userId: string) => void
//   sendMessage: (chatId: string, message: Message) => void
//   getUnassignedChats: (userId: string) => void
//   getOpenChats: (userId: string) => void
//   getResolvedChats: (userId: string) => void
//   getChatInfo: (userId: string) => void
//   searchShopifyProduct: (shopifyId: string) => void
//   getCustomerCart: (shopifyId: string) => void
//   searchChats: () => void
// }


// const inboxStore = createStore<State & Partial<Actions>>(
//   ((set) => ({
//     currentChatId: undefined,
//     setCurrentChatId: (chatId) =>
//       set((state) => ({ ...state, currentChatId: chatId })),
//   })))

// export default inboxStore