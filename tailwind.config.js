/** @type {import('tailwindcss').Config} */

module.exports = {
  important: true,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/flowbite/**/*.js"
  ],
  safelist: [
    'bg-gradient-to-r',
    'from-green-300',
    'via-blue-500',
    'to-purple-600',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      }
    }
  },
  daisyui: {
    themes: ['lofi', 'dark'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animated'),
    require('daisyui'),
    require('flowbite/plugin')({charts: true})

  ],
};
