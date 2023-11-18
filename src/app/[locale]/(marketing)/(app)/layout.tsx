import clsx from 'clsx';
import { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';

import { Header } from '../components/Header';
import Footer from '../Footer';

export const metadata: Metadata = {
  title: {
    template: '%s - eChat by Ekrata',
    default: 'eChat - Elevate your customer service',
  },
  description:
    'eChat - Elevate your customer service with eChat by Ekrata™️ - the AI-driven solution.',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={clsx(
        'h-full scroll-smooth bg-white antialiased',
        inter.variable,
        lexend.variable,
      )}
    > <body className="flex flex-col h-full bg-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
