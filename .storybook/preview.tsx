import '../src/app/globals.css';
import React from 'react';
import { Preview } from '@storybook/react';
import { initialize } from 'msw-storybook-addon';
import { mswLoader } from 'msw-storybook-addon';
import LocaleLayout from '../src/app/[locale]/layout'
import Link from "next/link";
import { notFound } from 'next/navigation';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});


Object.defineProperty(Link, "default", {
  configurable: true,
  value: (props) => <a {...props} />,
});

export const metadata = {
  title: 'Crow Commerce',
  description: 'Grow With Crow Commerce',
};




// export default function RootLayout({ children }: PropsWithChildren) {
//   const locale = useLocale();
//   let messages;
//   try {
//     import(`../../messages/${locale}.json`).then((data) => {
//       messages = data.default
//     })
//   } catch (error) {
//     notFound();
//   }

//   return (
//     <html lang={locale} className={`${inter.className}`}>
//       <NextIntlClientProvider locale={locale} messages={messages}>
//           <body>{children}</body>
//       </NextIntlClientProvider>
//     </html>
//   );
// }
let messages;
  try {
    import(`../messages/en.json`).then(data => {
      messages = data
    })
  } catch (error) {
    notFound();
  }


const preview: Preview = {
  parameters: {
    appDirectory: true,
  },
  decorators: [
    (Story) => <LocaleLayout params={{locale: 'en', overrideMessages: messages}}>
          <Story></Story>
      </LocaleLayout>
  ],
  loaders: [mswLoader],
};

export default preview;