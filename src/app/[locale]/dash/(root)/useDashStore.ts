// import { create } from 'zustand';
// import { Chat } from './inbox/Chat.type';

// type Feature = 'inbox' | 'chat-bot' | 'settings' | 'home';

// interface State {
//   currentChatId?: string;
//   currentFeature?: Feature;
//   currentSearchTerm?: string;
//   org: E;
//   loading: boolean;
//   error: string;
// }

// const initialState: State = {
//   loading: false,
//   error: '',
// };

// type Actions = {
//   setCurrentFeature: (feature: Feature) => void;
//   setCurrentOrg: (orgId: string) => void;
// };

// export const useDashStore = create<State & Actions>((set) => ({
//   loading: initialState.loading,
//   error: initialState.error,
//   chats: initialState.chats,
//   currentChatId: undefined,
//   setCurrentFeature: (feature) => set((state) => ({ ...state, feature })),
//   setCurrentOperator: (orgId) =>
//     set((state) => ({ ...state, currentOrg: orgId })),
// }));
// // set((state) => ({ ...state, loading: true }))
// // try {
// //   const res = await fetch("/")
// //   const users = await res.json()
// //   set((state) => ({ ...state, error: "", users }))
// // } catch (error) {
// //   set((state) => ({
// //     ...state,
// //     error: error.message,
// //   }))
// // } finally {
// //   set((state) => ({
// //     ...state,
// //     loading: false,
// //   }))
