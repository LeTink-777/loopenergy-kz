import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        // Logical thresholds only — never a device name.
        xs: '380px',
        nav: '960px',
      },
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
      fontSize: {
        'fluid-xs': 'var(--text-xs)',
        'fluid-sm': 'var(--text-sm)',
        'fluid-base': 'var(--text-base)',
        'fluid-md': 'var(--text-md)',
        'fluid-lg': 'var(--text-lg)',
        'fluid-xl': 'var(--text-xl)',
        'fluid-2xl': 'var(--text-2xl)',
        'fluid-3xl': 'var(--text-3xl)',
        'fluid-4xl': 'var(--text-4xl)',
        'fluid-5xl': 'var(--text-5xl)',
      },
      spacing: {
        'fluid-2xs': 'var(--space-2xs)',
        'fluid-xs': 'var(--space-xs)',
        'fluid-sm': 'var(--space-sm)',
        'fluid-md': 'var(--space-md)',
        'fluid-lg': 'var(--space-lg)',
        'fluid-xl': 'var(--space-xl)',
        'fluid-2xl': 'var(--space-2xl)',
        'fluid-3xl': 'var(--space-3xl)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-top': 'var(--safe-top)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        glow: '0 18px 60px -18px rgba(149, 97, 233, 0.55)',
        'glow-sm': '0 10px 34px -12px rgba(149, 97, 233, 0.4)',
      },
      backgroundImage: {
        'accent-grad': 'linear-gradient(135deg, var(--accent-light), var(--accent) 55%, var(--accent-dark))',
      },
    },
  },
  plugins: [],
};

export default config;
