'use client'
import { useRouter } from 'next/navigation';
import { PropsWithChildren, ReactNode, useState } from 'react';
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
  const router = useRouter()
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        networkMode: 'always'
      },
      queries: {
        networkMode: 'always'
      }
    }
  })

  return (
    <>
      {process?.env?.NEXT_PUBLIC_STAGE === 'prod' && router.push('/')}
      <QueryClientProvider
        client={overrideQueryClient ?? queryClient}
      >
        <DashSocketProvider>
          <div className='dark:bg-gray-900' >{children}</div>
          <ToastContainer position="top-center" className={'z-[200]'}
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