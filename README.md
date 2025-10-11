# Nomstead Open Marketplace

A Next.js 14 marketplace app that shows Buy, Sell and Profit opportunities from the Nomstead Open API.

## Features

- Homepage with tabs: **Buy**, **Sell**, **Profit** (Profit only on homepage)
- Foldable categories and subcategories
- Top 10 items per category for the selected tab
- Smart search with autocomplete suggestions (dropdown hides on select/click-outside)
- Search results page shows **Buy** by default and a tab to switch to **Sell**
- Buy cards (green), Sell cards (gold), Profit cards (light-blue)
- Bulk calculator (default = 1)
- Unit price and totals displayed in `gold`
- Refresh button
- Links to player's kingdom via `tile.url`

## Files

- `package.json`
- `next.config.js`
- `app/layout.jsx`
- `app/globals.css`
- `app/page.jsx`
- `app/searchResults.jsx`
- `app/components/ItemCard.jsx`
- `app/components/ProfitCard.jsx`

## Run locally

```bash
npm install
npm run dev
