import type { Config } from 'tailwindcss';

const shade = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: shade('brand-50'), 100: shade('brand-100'), 200: shade('brand-200'),
          300: shade('brand-300'), 400: shade('brand-400'), 500: shade('brand-500'),
          600: shade('brand-600'), 700: shade('brand-700'), 800: shade('brand-800'),
          900: shade('brand-900'), 950: shade('brand-950'),
        },
        navy: {
          50: '#f3f6fb', 100: '#e4eaf3', 200: '#c6d3e6', 300: '#9bb0d0', 400: '#6982b0',
          500: '#475f93', 600: '#36497a', 700: '#2c3c64', 800: '#1f2c4d', 900: '#16213c', 950: '#0b1326',
        },
        cyan: { 50: '#edfafd', 100: '#d2f2f9', 200: '#aae6f2', 300: '#71d3e6', 400: '#36b7d2', 500: '#1d99b6', 600: '#1a7c98' },
        mint: { 50: '#eefaf4', 100: '#d4f1e3', 200: '#a9e2c7', 300: '#74cda5', 400: '#41b083', 500: '#239268', 600: '#17805a' },
        ink: { DEFAULT: shade('ink'), soft: shade('ink-soft'), faint: shade('ink-faint') },
        cloud: '#f6f9fe',
        icy: '#fbfdff',
        surface: { DEFAULT: '#ffffff', muted: '#f3f6fa', warm: '#faf9f6', raised: '#fbfcfe', canvas: '#eef2f7' },
        line: { DEFAULT: '#e4eaf1', strong: '#d3dce6' },
        health: { 50: '#ecfdf5', 500: '#10b981', 600: '#059669', 700: '#047857' },
      },
      fontFamily: {
        ar: ['var(--font-ar)', 'system-ui', 'sans-serif'],
        en: ['var(--font-en)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.4rem, 5vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 3.6vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.6rem, 2.4vw, 2.25rem)', { lineHeight: '1.16', letterSpacing: '-0.01em' }],
        h3: ['1.3rem', { lineHeight: '1.25' }],
        lead: ['1.125rem', { lineHeight: '1.7' }],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,33,66,0.05)',
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        float: '0 18px 50px -18px rgba(15,33,66,0.32)',
        glow: '0 0 0 1px rgba(52,112,228,0.10), 0 24px 60px -24px rgba(32,86,196,0.45)',
        emergency: '0 16px 40px -16px rgba(190,40,70,0.5)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        lift: '0 2px 6px rgba(15,31,48,.06), 0 14px 36px -10px rgba(15,31,48,.16)',
        pop: '0 8px 16px rgba(15,31,48,.07), 0 28px 72px -16px rgba(15,31,48,.24)',
        'inner-soft': 'inset 0 1px 2px rgba(15,31,48,.05)',
      },
      borderRadius: {
        md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)', '3xl': 'var(--radius-3xl)', '4xl': '2.1rem',
      },
      maxWidth: { content: '76rem' },
      transitionTimingFunction: { spring: 'cubic-bezier(.34,1.3,.5,1)' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        floatySlow: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pop: { '0%': { transform: 'scale(0.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        sheen: { '0%': { transform: 'translateX(-120%)' }, '60%,100%': { transform: 'translateX(220%)' } },
        drawLine: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        floatySlow: 'floatySlow 9s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.22,0.61,0.36,1) both',
        fadeIn: 'fadeIn 0.8s ease-out both',
        pop: 'pop 0.35s ease-out both',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite',
        spinSlow: 'spinSlow 26s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
