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
        success: {
          DEFAULT: 'var(--color-success)',
          dark: 'var(--color-success-dark)',
        },
        gold: 'var(--color-gold)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)',
        },
      },
      // Custom font - can be changed in globals.css
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
      },
      // Claymorphism tokens (defined in globals.css)
      borderRadius: {
        clay: 'var(--clay-radius)',
        'clay-sm': 'var(--clay-radius-sm)',
      },
      boxShadow: {
        'clay-sm': 'var(--clay-shadow-sm)',
        'clay-md': 'var(--clay-shadow-md)',
        'clay-lg': 'var(--clay-shadow-lg)',
        'clay-inset': 'var(--clay-inset)',
      },
    },
  },
  plugins: [],
};

export default config;
