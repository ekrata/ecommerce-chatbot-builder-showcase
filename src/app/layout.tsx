import { NextIntlClientProvider, useLocale } from 'next-intl';
import { Inter } from 'next/font/google';
import { FC, PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';
import './globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Crow Commerce',
  description: 'Grow With Crow Commerce',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = useLocale();
  const queryClient = new QueryClient({defaultOptions: {queries: {
    cacheTime: Infinity,
    staleTime: Infinity,
  }}})
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} className={`${inter.className}`}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          <body>{children}</body>
        </QueryClientProvider>
      </NextIntlClientProvider>
    </html>
  );
}
