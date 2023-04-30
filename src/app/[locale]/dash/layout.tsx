import { PropsWithChildren } from 'react';
import DashNavbar from './DashNavbar';
import DashHeader from './DashHeader';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DashHeader />
      <div className='flex'>
        <div className='lg:left-0 h-screen w-14 font-medium bg-gray-800 '>
          <DashNavbar />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
}
