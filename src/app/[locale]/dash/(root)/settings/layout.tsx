import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

import { SettingsMenu } from './SettingsMenu';

export default function Layout({ children }: PropsWithChildren) {
  return <div className="grid grid-cols-12">
    <div className=' p-2 bg-white col-span-0 lg:col-span-3 border-r-[1px]'>
      <SettingsMenu />
    </div>
    <div className='h-screen col-span-12 p-2 bg-white shadow-lg lg:col-span-9'>
      {children}
    </div>
  </div>
}