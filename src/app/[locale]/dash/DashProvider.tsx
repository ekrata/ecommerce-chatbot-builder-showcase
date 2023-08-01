import { PropsWithChildren, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import { DashSocketProvider } from './DashSocketProvider';

export interface Props {
  children: ReactNode
  overrideQueryClient?: QueryClient,
  mockWsUrl?: string,
}

export const DashProvider: React.FC<PropsWithChildren<Props>> = ({ overrideQueryClient, mockWsUrl, children }: PropsWithChildren<Props>) => {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        staleTime: Infinity,
      }
    }
  })

  const persister = createSyncStoragePersister({ storage: window.localStorage })

  persistQueryClient({
    queryClient,
    persister,
  })

  console.log(mockWsUrl)
  return (
    <>
      <QueryClientProvider
        client={overrideQueryClient ?? queryClient}
      >
        <DashSocketProvider mockWsUrl={mockWsUrl}>
          <div className='dark:bg-gray-900' >{children}</div>
          <ToastContainer position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" />
        </DashSocketProvider>
      </QueryClientProvider>
    </>
  );
}