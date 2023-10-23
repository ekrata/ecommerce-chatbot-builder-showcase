'use client'
import { PropsWithChildren, ReactNode } from 'react';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { WidgetSockerProvider } from './WidgetSocketProvider';

export interface Props {
  children: ReactNode
  overrideQueryClient?: QueryClient
}

export const WidgetProvider: React.FC<PropsWithChildren<Props>> = ({ overrideQueryClient, children }: PropsWithChildren<Props>) => {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        staleTime: Infinity,
      }
    }
  })

  if (typeof window !== "undefined") {

    const persister = createSyncStoragePersister({ storage: window?.localStorage })

    persistQueryClient({
      queryClient,
      persister,
    })

    return (
      <>
        <QueryClientProvider
          client={overrideQueryClient ?? queryClient}
        >
          <WidgetSockerProvider>
            <div className='' >{children}</div>
          </WidgetSockerProvider>
        </QueryClientProvider>
      </>
    );
  }
  return null
}