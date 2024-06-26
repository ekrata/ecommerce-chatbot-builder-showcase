/** @type {import('tailwindcss').Config} */

module.exports = {
  important: true,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-gradient-to-r',
    'from-green-300',
    'via-blue-500',
    'to-purple-600',
  ],
  theme: {
    // extend: {
    //   fontFamily: {
    //     sans: ['var(--font-inter)'],
    //     mono: ['var(--font-roboto-mono)'],
    //   },
    // },
  },
  daisyui: {
    themes: ['lofi', 'dark'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwindcss-animated"),
    require('daisyui'),
  ],
};
