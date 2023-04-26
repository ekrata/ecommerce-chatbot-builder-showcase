import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';
import DashNavbar from './DashNavbar';
import DashHeader from './DashHeader';

export default function Page({ children }: PropsWithChildren) {
  const t = useTranslations('app.layout');

  return (
    <>
      <DashHeader />
      <DashNavbar />
      {children}
    </>
  );
}
