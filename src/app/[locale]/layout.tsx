import { useLocale } from 'next-intl';
import { Inter } from 'next/font/google';
import { FC, PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';
import ComplexNavbar from './ComplexNavbar';
import Footer from './Footer';

interface Props {
  params: { locale: string };
}

const RootLayout: FC<PropsWithChildren<Props>> = ({ children, params }) => {
  const locale = useLocale();
  if (params.locale !== locale) {
    notFound();
  }

  return (
    <main>
      <div className='tracking-wide font-medium text-black'>
        <ComplexNavbar />
        {children}
        <Footer />
      </div>
    </main>
  );
};

export default RootLayout;
