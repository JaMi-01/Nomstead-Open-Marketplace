/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nomBuy: {
          DEFAULT: '#047857',
          accent: '#34d399'
        },
        nomSell: {
          DEFAULT: '#92400e',
          accent: '#fcd34d'
        },
        nomProfit: {
          DEFAULT: '#60a5fa',
          accent: '#bfdbfe'
        }
      }
    }
  },
  plugins: []
}
