'use client'
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  MutationCache, QueryCache, QueryClient, QueryClientProvider, useIsRestoring
} from '@tanstack/react-query';
import {
  persistQueryClient, PersistQueryClientProvider, persistQueryClientRestore
} from '@tanstack/react-query-persist-client';

import { WidgetSockerProvider } from './WidgetSocketProvider';

export interface Props {
  children: ReactNode
  overrideQueryClient?: QueryClient
}

export const WidgetProvider: React.FC<PropsWithChildren<Props>> = ({ overrideQueryClient, children }: PropsWithChildren<Props>) => {
  // Create a client

  const [buster, setbuster] = useLocalStorage('widgetRqBuster', uuidv4())
  const isRestoring = useIsRestoring()

  if (typeof window !== "undefined") {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          cacheTime: Infinity,
          staleTime: Infinity,
        }
      }
    })


    const persister = createSyncStoragePersister({ storage: window.localStorage });

    // useEffect(() => {
    // if (typeof window !== "undefined") {

    //     console.log('new', buster)
    //     // persistQueryClientRestore({
    //     //   queryClient,
    //     //   persister,
    //     //   // maxAge = 1000 * 60 * 60 * 24, // 24 hours
    //     //   buster,
    //     //   // hydrateOptions = undefined,
    //     // })
    //     persistQueryClient({
    //       queryClient,
    //       persister,
    //       // buster
    //     })
    //     console.log(queryClient.getQueriesData)
    //   }
    // }, [buster])
    return (
      <>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          {!isRestoring &&
            <WidgetSockerProvider>
              <div className='' >{children}</div>
            </WidgetSockerProvider>
          }
        </PersistQueryClientProvider>
      </>
    );



  }
  return null
}