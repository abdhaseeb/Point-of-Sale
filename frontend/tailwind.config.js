/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f11',
          1: '#17171a',
          2: '#1f1f24',
          3: '#27272e',
        },
        border: '#2e2e38',
        accent: {
          DEFAULT: '#7c6af7',
          hover: '#9b8dff',
          muted: '#7c6af720',
        },
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        muted: '#71717a',
        subtle: '#3f3f4a',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(124,106,247,0.15)',
        card: '0 1px 3px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
