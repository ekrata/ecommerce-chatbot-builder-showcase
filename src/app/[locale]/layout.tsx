
import '../globals.css';

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl';
import { notFound } from 'next/navigation';
import React from 'react';

import { AuthProvider } from './(hooks)/AuthProvider';
import { QueryClientWrapper } from './(hooks)/QueryClientProvider';

export const metadata = {
  title: 'Crow Commerce',
  description: 'Grow With Crow Commerce',
};

const locales = ['en', 'de'];


export default function LocaleLayout({ children, params: { overrideMessages } }: { children: any, params: { locale: string, overrideMessages?: any } }) {
  let messages;
  const locale = useLocale();
  // if (!overrideMessages) {
  try {
    console.log('importing')
    import(`../../../messages/${locale}.json`).then(data => {
      messages = data
    })
  } catch (error) {
    notFound();
  }
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();



  return (
    <html lang={locale}>
      <body>
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
