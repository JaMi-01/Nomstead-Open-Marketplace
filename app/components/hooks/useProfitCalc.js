'use client';
import { useMemo } from 'react';

/**
 * useProfitCalc (v4.4.3f)
 * Calculates profit items and preserves exact decimal precision.
 * Filters out zero-profit results robustly (both numeric and formatted).
 */
export default function useProfitCalc(grouped) {
  const profitItems = useMemo(() => {
    const list = [];

    Object.keys(grouped).forEach((cat) => {
      Object.keys(grouped[cat]).forEach((sub) => {
        grouped[cat][sub].forEach((it) => {
          if (!it.buyOffers?.length || !it.sellOffers?.length) return;

          // Best buyer = highest price
          const bestBuyer = it.sellOffers.reduce((a, b) =>
            Number(a.unitPrice) >= Number(b.unitPrice) ? a : b
          );

          // Sellers that are cheaper than best buyer
          const profitableSellers = it.buyOffers.filter(
            (s) => Number(s.unitPrice) < Number(bestBuyer.unitPrice)
          );

          // Decimal precision is tied to the SELL price representation
          const sellPriceStr = bestBuyer.unitPrice?.toString() ?? '0';
          const decimals = sellPriceStr.includes('.')
            ? sellPriceStr.split('.')[1].length
            : 0;

          profitableSellers.forEach((seller) => {
            const profitNum =
              Number(bestBuyer.unitPrice) - Number(seller.unitPrice);

            // Skip if numeric profit is <= 0
            if (profitNum <= 0) return;

            const profitStr = profitNum.toFixed(decimals);

            // Also skip if formatted profit collapses to 0 at the chosen precision
            if (Number(profitStr) <= 0) return;

            list.push({
              slug: it.slug,
              name: it.name,
              category: cat,
              subCategory: sub,
              type: it.type,
              image: it.image,
              buy: seller,                 // keep unitPrice as string from upstream
              sell: bestBuyer,             // keep unitPrice as string from upstream
              profitPerUnit: profitNum,    // numeric, for sorting
              profitPerUnitStr: profitStr, // formatted with exact decimals for UI
              profitDecimals: decimals,    // pass precision to UI for totals
            });
          });
        });
      });
    });

    // Sort by numeric profit desc
    return list.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped]);

  // Group by category/subcategory for UI
  const groupedProfit = useMemo(() => {
    const map = {};
    profitItems.forEach((p) => {
      const cat = p.category || 'Misc';
      const sub = p.subCategory || 'General';
      map[cat] ??= {};
      map[cat][sub] ??= [];
      map[cat][sub].push(p);
    });
    return map;
  }, [profitItems]);

  return { profitItems, groupedProfit };
}