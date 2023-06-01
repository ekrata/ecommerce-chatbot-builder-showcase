import '../src/app/globals.css';
import React from 'react';
import { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import messages from '../messages/en.json';
import { initialize, mswDecorator } from 'msw-storybook-addon';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

const preview: Preview = {
  decorators: [
    mswDecorator,
    (Story) => (
      <html lang={'en'} className={`${inter.className}`}>
        <NextIntlClientProvider locale={'en'} messages={messages}>
          <body>
            <Story />
          </body>
        </NextIntlClientProvider>
      </html>
    ),
  ],
};

export default preview;
