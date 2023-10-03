import { PropsWithChildren } from 'react';

import DashNavbar from './DashNavbar';
import { DashProvider } from './DashProvider';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DashProvider>
        <div className="flex flex-row">
          <div className='w-10 h-screen bg-black shadow-2xl place-items-center'>
            <DashNavbar></DashNavbar>
          </div>
          <div className='w-full col-span-11'>
            {children}
          </div>
        </div>
      </DashProvider >
    </>
  );
}
