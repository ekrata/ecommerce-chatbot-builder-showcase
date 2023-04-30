'use client';

import { PropsWithChildren } from 'react';

export default function Page({ children }: PropsWithChildren) {
  // useDashStore((state) => state.setCurrentFeature('home'));

  return <div>{children}</div>;
}
