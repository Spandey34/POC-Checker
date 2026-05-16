/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy:  { DEFAULT: '#1B2A4A', light: '#2A3F6A', dark: '#0F1A2E' },
        gold:  { DEFAULT: '#C9A84C', light: '#E0C06A', dark: '#A0812A' },
        slate: { 50: '#F8F9FB', 100: '#EFF1F6', 200: '#D8DCE9', 700: '#4A567A', 900: '#1C2B4A' },
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease-out both',
        'slide-up':  'slideUp 0.35s ease-out both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },
    },
  },
  plugins: [],
};
