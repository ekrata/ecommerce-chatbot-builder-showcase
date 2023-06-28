import React, { PropsWithChildren} from 'react';
import { WidgetProvider } from './WidgetProvider';

/**
 * Contains reactQuery providers 
 * @date 28/06/2023 - 10:56:23
 *
 * @export
 * @param {PropsWithChildren<Props>} { children, overrideQueryClient }
 * @returns {*}
 */
export default function Layout({ children }: PropsWithChildren) {  
  return (<WidgetProvider>
      <div className='dark:bg-gray-900' >{children}</div>
    </WidgetProvider>
    )
}

    // <>
    //   <PersistQueryClientProvider
    //     client={queryClient}
    //     persistOptions={{ persister }}
    //   >
    //   
    // </PersistQueryClientProvider>
    // </>
