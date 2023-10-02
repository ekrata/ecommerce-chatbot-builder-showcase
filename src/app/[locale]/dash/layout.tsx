import { PropsWithChildren } from 'react';

import DashNavbar from './DashNavbar';
import { DashProvider } from './DashProvider';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DashProvider>
        <div className="flex flex-row">
          <div className='w-12 bg-black'>
            <DashNavbar></DashNavbar>
          </div>
          <div className='col-span-11'>
            {children}
          </div>
        </div>
      </DashProvider >
    </>
  );
}
