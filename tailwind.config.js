/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nomBuy: {
          DEFAULT: '#047857',
          light: '#34d399'
        },
        nomSell: {
          DEFAULT: '#92400e',
          light: '#fcd34d'
        },
        nomProfit: {
          DEFAULT: '#cfe8ff',
          dark: '#3b82f6'
        }
      }
    }
  },
  plugins: [],
}
