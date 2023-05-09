import '../src/app/globals.css';
import React from 'react';
import { Preview } from '@storybook/react';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

import messages from '../messages/en.json';
import { mswDecorator } from 'msw-storybook-addon';

const preview: Preview = {
  decorators: [
    (Story) => (
      <html lang={'en'} className={`${inter.className}`}>
        <NextIntlClientProvider locale={'en'} messages={messages}>
          <body>
            <Story />
          </body>
        </NextIntlClientProvider>
      </html>
    ),
    mswDecorator,
  ],
};

export default preview;
