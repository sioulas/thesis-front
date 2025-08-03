/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        backgroundDark: '#0C0C0C',
        primaryBlue: '#0D5EA6',
        lightText: '#FBFBFB'
      },
    },
  },
  plugins: [],
}

