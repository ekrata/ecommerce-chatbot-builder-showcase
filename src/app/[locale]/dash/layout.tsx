import { PropsWithChildren } from 'react';

import DashHeader from './DashHeader';
import DashNavbar from './DashNavbar';
import { DashProvider } from './DashProvider';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <DashProvider>
        {children}
      </DashProvider>
    </>
  );
}
