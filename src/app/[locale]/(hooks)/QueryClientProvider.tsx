'use client'

import { PropsWithChildren, ReactNode, useState } from 'react';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export interface Props {
  children: ReactNode
  overrideQueryClient?: QueryClient
}

export const QueryClientWrapper: React.FC<PropsWithChildren<Props>> = ({ overrideQueryClient, children }: PropsWithChildren<Props>) => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        staleTime: Infinity,
      }
    }
  }))

  // const persister = createSyncStoragePersister({ storage: window.localStorage })

  // persistQueryClient({
  //   queryClient,
  //   persister,
  // })

  return (
    <>
      <QueryClientProvider
        client={overrideQueryClient ?? queryClient}
      >
        {children}
      </QueryClientProvider>
    </>
  );
}