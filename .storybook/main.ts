import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-actions',
    'storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true,
  },
  env: (config) => ({
    ...config,
    NEXT_PUBLIC_AP_ORG_ID: '160bb0e3-bfef-419e-bed0-43c2d06b84d4',
    // Object.entries(process.env).map(([key, value]) => key))
  }),
  webpackFinal: async (config, { configType }) => {
    if (config?.resolve)
      config.resolve.alias = {
        ...config?.resolve?.alias,
      };
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default config;
