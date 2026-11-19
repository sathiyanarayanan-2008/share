/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0c1322',
          850: '#111b2e',
          800: '#18243c',
          700: '#233352',
          600: '#334870',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        }
      },
      boxShadow: {
        '3d-sm': '0 4px 0 0 rgba(15, 23, 42, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.3)',
        '3d': '0 6px 0 0 rgba(15, 23, 42, 0.5), 0 12px 24px -4px rgba(0, 0, 0, 0.4)',
        '3d-hover': '0 2px 0 0 rgba(15, 23, 42, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
