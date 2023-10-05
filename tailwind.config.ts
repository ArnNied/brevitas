import type { Config } from 'tailwindcss';

const defaulTheme = require('tailwindcss/defaultTheme');

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaulTheme.fontFamily.sans],
      },
      // https://www.realtimecolors.com/?colors=0b0909-fdfcfc-faba7a-deecd0-d90808
      colors: {
        text: {
          base: '#0b0909',
          50: '#f4f1f1',
          100: '#e8e3e3',
          200: '#d1c7c7',
          300: '#baabab',
          400: '#a38f8f',
          500: '#8c7373',
          600: '#705c5c',
          700: '#544545',
          800: '#382e2e',
          900: '#1c1717',
          950: '#0e0b0b',
        },
        background: {
          base: '#fdfcfc',
          50: '#f5f0f0',
          100: '#ebe0e0',
          200: '#d6c2c2',
          300: '#c2a3a3',
          400: '#ad8585',
          500: '#996666',
          600: '#7a5252',
          700: '#5c3d3d',
          800: '#3d2929',
          900: '#1f1414',
          950: '#0f0a0a',
        },
        primary: {
          base: '#faba7a',
          50: '#fef2e6',
          100: '#fde6ce',
          200: '#fbcc9d',
          300: '#fab36b',
          400: '#f8993a',
          500: '#f68009',
          600: '#c56607',
          700: '#944c05',
          800: '#623304',
          900: '#311a02',
          950: '#190d01',
        },
        secondary: {
          base: '#deecd0',
          50: '#f2f8ed',
          100: '#e6f0db',
          200: '#cce1b7',
          300: '#b3d392',
          400: '#99c46e',
          500: '#80b54a',
          600: '#66913b',
          700: '#4d6d2c',
          800: '#33481e',
          900: '#1a240f',
          950: '#0d1207',
        },
        accent: {
          base: '#d90808',
          50: '#fee6e6',
          100: '#fdcece',
          200: '#fb9d9d',
          300: '#fa6b6b',
          400: '#f83a3a',
          500: '#f60909',
          600: '#c50707',
          700: '#940505',
          800: '#620404',
          900: '#310202',
          950: '#190101',
        },
      },
    },
  },
  plugins: [],
};
export default config;
