import { create } from "zustand"


type Feature = 'inbox' | 'chat-bot' | 'settings' | 'home'

interface State {
  currentChatId?: string
  currentFeature?: Feature
  currentSearchTerm?: string
}

type Actions = {
  setCurrentChatId: (chatId: string) => void
  setCurrentFeature: (feature: Feature) => void
}


export const useDashStore = create<State & Actions>(
  ((set) => ({
    currentChatId: undefined,
    setCurrentChatId: (chatId) =>
      set((state) => ({ ...state, currentChatId: chatId })),
    setCurrentFeature: (feature) =>
      set((state) => ({ ...state, feature })),
  })))