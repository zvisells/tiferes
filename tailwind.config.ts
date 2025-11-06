import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-bg': 'var(--color-bg)',
        'custom-text': 'var(--color-text)',
        'custom-accent': 'var(--color-accent)',
      },
      fontFamily: {
        main: 'var(--font-main)',
      },
    },
  },
  plugins: [],
};
export default config;

