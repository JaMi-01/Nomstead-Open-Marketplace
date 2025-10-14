/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nomBuy: '#047857',
        nomBuyLight: '#34d399',
        nomSell: '#92400e',
        nomSellLight: '#fcd34d',
        nomProfit: '#0ea5e9',
        nomProfitLight: '#cfe8ff'
      }
    }
  },
  plugins: []
};
