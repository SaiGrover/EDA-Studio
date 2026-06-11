/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
      },
      colors: {
        rose: {
          DEFAULT: '#f4a8b8',
          light: '#fdf0f3',
          mid: '#e8778f',
          dark: '#c44d6a',
        },
        sage: {
          DEFAULT: '#a8c5b8',
          light: '#eef5f2',
          mid: '#6fa896',
          dark: '#3d7a6b',
        },
        sand: {
          DEFAULT: '#e8d5b7',
          light: '#faf5ed',
          mid: '#c9a87a',
          dark: '#8a6540',
        },
        lavender: {
          DEFAULT: '#c5b8e8',
          light: '#f3f0fb',
          mid: '#9b89d4',
          dark: '#5e4aaa',
        },
        sky: {
          DEFAULT: '#b8d4e8',
          light: '#eef4f9',
          mid: '#6a9fc4',
          dark: '#2d6a96',
        },
        peach: {
          DEFAULT: '#f4c5a8',
          light: '#fef5ef',
          mid: '#d4894a',
          dark: '#9a5520',
        },
        cream: '#faf7f2',
        ink: {
          DEFAULT: '#2d2820',
          mid: '#6b6258',
          light: '#a09890',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 2px 16px rgba(45,40,32,0.07), 0 1px 4px rgba(45,40,32,0.05)',
        'card-md': '0 4px 24px rgba(45,40,32,0.10), 0 2px 8px rgba(45,40,32,0.06)',
        'card-hover': '0 8px 32px rgba(45,40,32,0.13), 0 2px 8px rgba(45,40,32,0.07)',
        glow: '0 0 40px rgba(196,77,106,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'number-up': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease forwards',
        'fade-in': 'fade-in 0.4s ease forwards',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        spin: 'spin 0.9s linear infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        'number-up': 'number-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
