import { PropsWithChildren } from 'react';

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
