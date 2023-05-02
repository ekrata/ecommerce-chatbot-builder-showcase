import { create } from "zustand"
import { Chat } from "./inbox/Chat.type"



type Feature = 'inbox' | 'chat-bot' | 'settings' | 'home'

interface State {
  currentChatId?: string
  currentFeature?: Feature
  currentSearchTerm?: string
  chats: Chat[],
  loading: boolean,
  error: string
}

const initialState: State = {
  chats: [],
  loading: false,
  error: "",
}

type Actions = {
  setCurrentChatId: (chatId: string) => void
  setCurrentFeature: (feature: Feature) => void
}


export const useDashStore = create<State & Actions>(
  ((set) => ({
    loading: initialState.loading,
    error: initialState.error,
    chats: initialState.chats,
    currentChatId: undefined,
    setCurrentChatId: (chatId) =>
      set((state) => ({ ...state, currentChatId: chatId })),
    setCurrentFeature: (feature) =>
      set((state) => ({ ...state, feature })),
    fetchChats: () =>
      []
    // set((state) => ({ ...state, loading: true }))
    // try {
    //   const res = await fetch("/")
    //   const users = await res.json()
    //   set((state) => ({ ...state, error: "", users }))
    // } catch (error) {
    //   set((state) => ({
    //     ...state,
    //     error: error.message,
    //   }))
    // } finally {
    //   set((state) => ({
    //     ...state,
    //     loading: false,
    //   }))

  }
  )))