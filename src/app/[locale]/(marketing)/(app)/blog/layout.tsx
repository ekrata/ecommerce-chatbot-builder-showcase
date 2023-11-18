import { PropsWithChildren } from 'react';

// blog/layout.tsx
export const metadata = {
  title: {
    template: '%s | eChat Ekrata Blog',
    default: 'eChat Ekrata Blog',
  },
  description:
    'Elevate your customer service with eChat by Ekrata™️ - the AI-driven solution.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#000' },
  ],
  openGraph: {
    title: 'eChat Ekrata',
    description:
      'Elevate your customer service with eChat by Ekrata™️ - the AI-driven solution.',
    url: 'https://echat.ekrata.com',
    siteName: 'eChat Ekrata',
    locale: 'en_US',
    type: 'website',
    // To use your own endpoint, refer to https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation
    // Note that an official `app/` solution is coming soon.
    // images: [
    //   {
    //     url: `https://maxleiter.com/api/og?title=${encodeURIComponent(
    //       "Max Leiter's site",
    //     )}`,
    //     width: 1200,
    //     height: 630,
    //     alt: '',
    //   },
    // ],
  },
  // twitter: {
  //   title: '',
  //   card: 'summary_large_image',
  //   creator: '@max_leiter',
  // },
  // icons: {
  //   shortcut: 'https://maxleiter.com/favicons/favicon.ico',
  // },
  // alternates: {
  //   types: {
  //     // See the RSS Feed section for more details
  //     'application/rss+xml': 'https://maxleiter.com/feed.xml',
  //   },
  // },
};

// layout.tsx
export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      {children}
    </div>
  )
}

