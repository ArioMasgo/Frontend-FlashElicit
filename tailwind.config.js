/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Habilita el modo dark usando la clase 'dark'
  theme: {
    extend: {
      colors: {
        'dark-blue': {
          50: '#f2f3ff',
          100: '#e8e9ff',
          200: '#d3d4ff',
          300: '#b0b0ff',
          400: '#8983ff',
          500: '#6351ff',
          600: '#4e2dfa',
          700: '#3f1be6',
          800: '#3416bd',
          900: '#2d149e',
          950: '#180a6b',
        },
      },
    },
  },
  plugins: [],
}
