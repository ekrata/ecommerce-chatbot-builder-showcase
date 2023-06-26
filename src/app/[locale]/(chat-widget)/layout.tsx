import { PropsWithChildren } from 'react';
import { PersistQueryClientProvider  } from '@tanstack/react-query-persist-client'
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Layout({ children }: PropsWithChildren) {
  // Create a client
  const queryClient = new QueryClient({defaultOptions: {queries: {
    // cacheTime: Infinity,
    // staleTime: Infinity,
  }}})

  // const persister = createSyncStoragePersister({ storage: window.localStorage })

  return (
    <>
      <QueryClientProvider
        client={queryClient}
      >
      <div className='dark:bg-gray-900' >{children}</div>
    </QueryClientProvider>
    </>
  );
}

    // <>
    //   <PersistQueryClientProvider
    //     client={queryClient}
    //     persistOptions={{ persister }}
    //   >
    //   <div className='dark:bg-gray-900' >{children}</div>
    // </PersistQueryClientProvider>
    // </>
