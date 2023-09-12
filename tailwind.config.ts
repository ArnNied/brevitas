import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // https://realtimecolors.com/?colors=03021d-fafaff-37075f-fbcbf9-0808e2
      colors: {
        text: '#03021d',
        background: '#fafaff',
        primary: '#37075f',
        secondary: '#fbcbf9',
        accent: '#0808e2',
      },
    },
  },
  plugins: [],
};
export default config;
