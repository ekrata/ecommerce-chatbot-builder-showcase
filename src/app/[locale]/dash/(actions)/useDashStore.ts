import { EntityItem } from 'electrodb';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Conversation } from '@/entities/conversation';
import { Message } from '@/entities/message';
import { Customer } from '@/entities/customer';
import { Org } from '@/entities/org';
import { Configuration } from '@/entities/configuration';
import { Operator } from '@/entities/operator';
import { immer } from 'zustand/middleware/immer';

import { createDashState } from './DashState';
import { DashStateType } from './types';

export const useDashStore = create<DashStateType>()(
  persist(
    immer((...api) => ({
      ...createDashState(...api),
    })),
    {
      name: 'useDashStore',
      partialize: (state) => ({
        // Include the keys you want to persist in here.
        ...Object.keys(state),
      }),
      merge: (persistedState, currentState) => {
        // persistedState is unknown, so we need to cast it to CombinedState | undefined
        const typedPersistedState = persistedState as DashStateType | undefined;

        return {
          // We need to do a deep merge here because the default merge strategy is a
          // shallow merge. Without doing this, our actions would not be included in
          // our merged state, resulting in unexpected behavior.
          ...currentState,
          ...(typedPersistedState || {}),
        };
      },
    }
  )
);
