import '../../globals.css';

import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import { WidgetProvider } from './WidgetProvider';

export const metadata = {
  title: 'echat',
  description: '',
};

const locales = ['en', 'de'];
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }];
}

export default async function LocaleLayout({ children, params: { locale = 'en', overrideMessages } }: { children: any, params: { locale: string, overrideMessages?: any } }) {
  let messages
  // const locale = useLocale();
  // if (!overrideMessages) {
  console.log(locale)
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.log(error)
  }
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) console.log('no valid locale')

  return (
    <html lang={locale} className='bg-transparent'>
      <body className='bg-transparent'>
        <NextIntlClientProvider locale={locale ?? 'en'} messages={messages}>
          <WidgetProvider>
            {children}
          </WidgetProvider>
        </NextIntlClientProvider>
      </body>
    </html >
  );
}
