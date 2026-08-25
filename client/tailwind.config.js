/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High quality premium academic palette
        medical: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffc',
          300: '#7cc3fb',
          400: '#38a3f8',
          500: '#0e85eb',
          600: '#0267c7',
          700: '#0352a1',
          800: '#074685',
          900: '#0c3b6e',
          950: '#082548',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
