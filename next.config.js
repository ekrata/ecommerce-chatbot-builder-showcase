// /** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  'src/i18n.ts',
);
const withMDX = require('@next/mdx')()
 
 
const withPWA = require('next-pwa')({
  dest: 'public',
  scope: '/dash',
  disable: true,
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other Next.js configuration ...
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};


module.exports = withMDX(withPWA(withNextIntl(nextConfig)))

// Inected Content via Sentry Wizard Below

// const { withSentryConfig } = require('@sentry/nextjs');

// module.exports = withSentryConfig(
//   module.exports,
//   {
//     // For all available options, see:
//     // https://github.com/getsentry/sentry-webpack-plugin#options

//     // Suppresses source map uploading logs during build
//     silent: true,

//     org: 'ekrata',
//     project: 'javascript-nextjs',
//   },
//   {
//     // For all available options, see:
//     // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//     // Upload a larger set of source maps for prettier stack traces (increases build time)
//     widenClientFileUpload: true,

//     // Transpiles SDK to be compatible with IE11 (increases bundle size)
//     transpileClientSDK: true,

//     // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
//     tunnelRoute: '/monitoring',

//     // Hides source maps from generated client bundles
//     hideSourceMaps: true,

//     // Automatically tree-shake Sentry logger statements to reduce bundle size
//     disableLogger: true,
//   },
// );

// module.exports = {
//   async headers() {
//     return [
//       {
//         source: '/:login',
//         headers: [
//           {
//             key: 'Content-Security-Policy',
//             value: `script-src https://accounts.google.com/gsi/client; frame-src https://accounts.google.com/gsi/; connect-src https://accounts.google.com/gsi/;`,
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'no-referrer-when-downgrade',
//           },
//         ],
//       },
//     ];
//   },
// };
