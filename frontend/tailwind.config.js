/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1115',
          panel: '#171a21',
          border: '#2a3039',
        }
      }
    },
  },
  plugins: [],
}