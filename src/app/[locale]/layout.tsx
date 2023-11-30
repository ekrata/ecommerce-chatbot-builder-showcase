import '../globals.css';

import { NextIntlClientProvider, useLocale } from 'next-intl';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import React from 'react';

import en from '../../../messages/en.json';
import { AuthProvider } from './(hooks)/AuthProvider';
import { QueryClientWrapper } from './(hooks)/QueryClientProvider';

export const metadata = {
  title: 'eChat',
  description: 'Elevate with eChat',
};

const inter = Inter({
  subsets: ['latin'],
  // display: 'swap',
  variable: '--font-inter',
})

const locales = ['en', 'de'];
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

export default async function LocaleLayout({ children, params: { locale, overrideMessages } }: { children: any, params: { locale: string, overrideMessages?: any } }) {
  let messages;
  // const locale = useLocale();
  // if (!overrideMessages) {
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();

  return (
    <html lang={locale} className={`${inter.variable} font-sans w-screen`}>
      <body className='w-screen font-sans'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryClientWrapper
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryClientWrapper>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
