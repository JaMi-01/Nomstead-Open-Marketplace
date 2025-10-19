'use client';
import { useMemo } from 'react';

/**
 * useProfitCalc (v4.4.3e)
 * Calculates profit items and preserves exact decimal precision.
 */
export default function useProfitCalc(grouped) {
  const profitItems = useMemo(() => {
    const list = [];

    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => {
          if (!it.buyOffers?.length || !it.sellOffers?.length) return;

          // Find best buyer (highest price)
          const bestBuyer = it.sellOffers.reduce((a, b) =>
            Number(a.unitPrice) >= Number(b.unitPrice) ? a : b
          );

          // Find all sellers cheaper than that buyer
          const profitableSellers = it.buyOffers.filter(
            s => Number(s.unitPrice) < Number(bestBuyer.unitPrice)
          );

          // Determine decimal precision based on sell price
          const sellPriceStr = bestBuyer.unitPrice?.toString() ?? '0';
          const decimals = sellPriceStr.includes('.')
            ? sellPriceStr.split('.')[1].length
            : 0;

          profitableSellers.forEach(seller => {
            const profitNum =
              Number(bestBuyer.unitPrice) - Number(seller.unitPrice);

            // Skip zero or negative profits
            if (profitNum <= 0) return;

            const profitStr = profitNum.toFixed(decimals);

            list.push({
              slug: it.slug,
              name: it.name,
              category: cat,
              subCategory: sub,
              type: it.type,
              image: it.image,
              buy: seller,
              sell: bestBuyer,
              profitPerUnit: profitNum,
              profitPerUnitStr: profitStr, // 👈 exact decimal match for UI
            });
          });
        });
      });
    });

    // Sort descending by numeric profit
    return list.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped]);

  // Group by category/subcategory for UI rendering
  const groupedProfit = useMemo(() => {
    const map = {};
    profitItems.forEach(p => {
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