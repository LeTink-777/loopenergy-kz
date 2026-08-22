import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-soft': 'var(--bg-soft)',
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        card: 'var(--card-bg)',
        'w-80': 'var(--white-80)',
        'w-70': 'var(--white-70)',
        'w-50': 'var(--white-50)',
        'w-15': 'var(--white-15)',
        'w-10': 'var(--white-10)',
        'w-02': 'var(--white-02)',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '34px',
        pill: '999px',
      },
      maxWidth: {
        content: '1280px',
      },
      fontSize: {
        h1: ['clamp(2.25rem, 5.2vw, 4rem)', { lineHeight: '1.06', letterSpacing: '-1.5px', fontWeight: '800' }],
        h2: ['clamp(1.75rem, 3.6vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-1px', fontWeight: '800' }],
        h3: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        glow: '0 18px 60px -18px rgba(149, 97, 233, 0.55)',
        'glow-sm': '0 10px 34px -12px rgba(149, 97, 233, 0.4)',
      },
      backgroundImage: {
        'accent-grad': 'linear-gradient(135deg, var(--accent-light), var(--accent) 55%, var(--accent-dark))',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};

export default config;
