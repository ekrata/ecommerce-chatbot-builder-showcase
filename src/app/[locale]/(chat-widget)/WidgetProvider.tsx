import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import { PropsWithChildren, ReactNode } from "react"
import { WidgetSockerProvider } from "./WidgetSocketProvider"

export interface Props {
  children: ReactNode
  overrideQueryClient?: QueryClient
}

export const WidgetProvider: React.FC<PropsWithChildren<Props>> = ({overrideQueryClient, children}: PropsWithChildren<Props>) => {
  // Create a client
  const queryClient = new QueryClient({defaultOptions: {queries: {
    cacheTime: Infinity,
    staleTime: Infinity,
  }}})

  const persister = createSyncStoragePersister({ storage: window.localStorage })

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
          <div className='dark:bg-gray-900' >{children}</div>
        </WidgetSockerProvider>
      </QueryClientProvider>
    </>
  );
}