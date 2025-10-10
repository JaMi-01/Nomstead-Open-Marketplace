# Nomstead Open Marketplace

A Next.js 14 marketplace app that shows live buy/sell orders from the Nomstead Open API.

## Features

- Homepage with collapsible categories & subcategories.
- Tabs for **Buy** and **Sell** (both on the homepage and in search).
- Buy cards sorted by lowest price; Sell cards sorted by highest price.
- Search with autocomplete suggestions (dropdown disappears when an item is selected).
- Bulk calculator (default = 1), unit price & totals shown in `gold`.
- Refresh button to re-fetch marketplace data.
- Top 10 items shown per category on the homepage (for selected tab).
- Nice banner and card styling (green for buy, gold for sell).
- Profit potential ONLY displayed on the **search results page**.

## Files

- `package.json` — project settings & scripts
- `next.config.js` — image domains
- `app/layout.jsx` — global layout
- `app/page.jsx` — main page (homepage + search control)
- `app/searchResults.jsx` — search results (Buy/Sell tabs + profit)
- `app/itemCard.jsx` — card component for items

## Run locally

```bash
npm install
npm run dev
