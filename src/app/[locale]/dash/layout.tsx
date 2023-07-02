import { PropsWithChildren } from 'react';
import DashNavbar from './DashNavbar';
import DashHeader from './DashHeader';
import { DashProvider } from './DashProvider';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DashProvider>
        <DashHeader />
        <div className="flex">
          <div className="w-10 h-screen font-medium bg-gray-900 lg:left-0 ">
            <DashNavbar />
          </div>
          <div>{children}</div>
        </div>
      </DashProvider>
    </>
  );
}
