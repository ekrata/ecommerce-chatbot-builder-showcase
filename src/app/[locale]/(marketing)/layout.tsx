import { useLocale } from 'next-intl';
import { FC, PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';
import Navbar from './Navbar';
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
        <Navbar />
        {children}
        <Footer />
      </div>
    </main>
  );
};

export default RootLayout;
