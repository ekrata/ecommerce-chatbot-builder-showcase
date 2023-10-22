// /** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  // This is the default (also the `src` folder is supported out of the box)
  'src/i18n.ts',
);

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   scope: '/dash',
//   disable: true,
//   register: true,
//   skipWaiting: true,
// });

const nextConfig = {
  // Other Next.js configuration ...
  reactStrictMode: true,
  transpilePackages: ['../../../../', ],
  experimental: {
    typedRoutes: true,
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = withNextIntl(nextConfig)