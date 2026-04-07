/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.35)',
        card: '0 8px 25px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(1200px circle at 20% 10%, rgba(167, 139, 250, 0.35), transparent 40%), radial-gradient(900px circle at 90% 20%, rgba(192, 132, 252, 0.25), transparent 45%), linear-gradient(to bottom, rgba(13, 13, 25, 1), rgba(6, 7, 18, 1))',
      },
    },
  },
  plugins: [],
}

