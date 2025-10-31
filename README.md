# Nomstead Open Marketplace — Version 4

A fast, modern web marketplace built with Next.js and Tailwind CSS for tracking Nomstead game market offers.

## Highlights
- Unified Buy / Sell / Profit card layout
- Foldable categories and subcategories with dynamic item counts
- Profit tab grouped by category and subcategory
- Accurate profit logic: Buy from cheapest seller → Sell to best buyer
- Total uses the same number of decimals as the item price
- Prices are shown exactly as provided by the API (no rounding)
- Search: instant suggestions, mobile-friendly, dropdown closes on selection, clear (✕) button
- Timestamp shows “Last updated X min ago”
- Clean black text styling across cards
- Fully responsive UI with Tailwind CSS 3.4.14

## Tech
- Next.js 14 (App Router)
- Tailwind CSS 3.4.14
- Deployed on Vercel

## API
Uses the public Nomstead endpoint:  
https://api.nomstead.com/open/marketplace