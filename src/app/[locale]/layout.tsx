import '../globals.css';

import { NextIntlClientProvider, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Crow Commerce',
  description: 'Grow With Crow Commerce',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

export default function LocaleLayout({ children, params: { locale, overrideMessages } }: { children: ReactNode, params: { locale: string, overrideMessages?: any } }) {
  let messages;
  if (!overrideMessages) {
    try {
      import(`../../../messages/${locale}.json`).then(data => {
        messages = data
      })
    } catch (error) {
      notFound();
    }
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={overrideMessages ?? messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
