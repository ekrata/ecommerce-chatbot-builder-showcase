import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

interface State {
  currentChatId?: string
}

type Actions = {
  setCurrentChatId: (chatId: string) => void
}


export const useInboxStore = create(
  immer<State & Actions>((set) => ({
    currentChatId: undefined,
    setCurrentChatId: (chatId) =>
      set((state) => ({ ...state, currentChatId: chatId })),
  })))