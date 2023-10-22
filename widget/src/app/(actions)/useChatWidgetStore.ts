import { EntityItem } from 'electrodb';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createChatWidgetState } from './ChatWidgetState';

import type { CombinedState } from './types';
export const useChatWidgetStore = create<CombinedState>()(
  persist(
    immer((...api) => ({
      chatWidget: createChatWidgetState(...api),
    })),
    {
      name: 'useChatWidgetStore',
      partialize: (state) => ({
        // Include the keys you want to persist in here.
        chatWidget: {
          ...Object.keys(state.chatWidget),
        },
      }),
      merge: (persistedState, currentState) => {
        // persistedState is unknown, so we need to cast it to CombinedState | undefined
        const typedPersistedState = persistedState as CombinedState | undefined;

        return {
          chatWidget: {
            // We need to do a deep merge here because the default merge strategy is a
            // shallow merge. Without doing this, our actions would not be included in
            // our merged state, resulting in unexpected behavior.
            ...currentState.chatWidget,
            ...(typedPersistedState?.chatWidget || {}),
          },
        };
      },
    },
  ),
);
