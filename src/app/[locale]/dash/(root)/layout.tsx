'use client'
import 'react-toastify/dist/ReactToastify.css';

import { PropsWithChildren, Suspense } from 'react';

import DashNavbar from './DashNavbar';
import { DashProvider } from './DashProvider';

export default function Layout({ children }: PropsWithChildren) {

  return (
    <>
      <DashProvider>
        <div className="flex flex-row">
          <div className='w-10 h-screen bg-black place-items-center'>
            <DashNavbar></DashNavbar>
          </div>
          <div className='w-screen col-span-11 overflow-x-clip'>
            <Suspense fallback={<></>}>
              {children}
            </Suspense>
          </div>
        </div>
      </DashProvider >
    </>
  );
}
