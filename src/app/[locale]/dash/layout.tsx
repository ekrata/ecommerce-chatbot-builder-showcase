import { PropsWithChildren } from 'react';
import { WebSocketApi } from 'sst/node/api';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import DashNavbar from './DashNavbar';
import DashHeader from './DashHeader';

const { url } = WebSocketApi.appWs;

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <AppSocketProvider socketUrl={url}>
        <DashHeader />
        <div className="flex">
          <div className="lg:left-0 h-screen w-14 font-medium bg-gray-800 ">
            <DashNavbar />
          </div>
          <div>{children}</div>
        </div>
      </AppSocketProvider>
    </>
  );
}
