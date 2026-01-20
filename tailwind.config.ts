import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom colors - easy to modify for OT theme
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
      },
      // Custom font - can be changed in globals.css
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
