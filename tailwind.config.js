/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        ivory: '#F7F7F5',
        graySoft: '#E9E9E6',
        muted: '#8A8A86',
        line: '#D8D8D4',
        danger: '#B3261E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        none: 'none',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}

