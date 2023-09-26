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
      // https://realtimecolors.com/?colors=03021d-fafaff-37075f-e0c4f8-0808e2
      colors: {
        text: '#03021d',
        background: '#fafaff',
        primary: '#37075f',
        secondary: '#e0c4f8',
        accent: '#0808e2',
      },
    },
  },
  plugins: [],
};
export default config;
