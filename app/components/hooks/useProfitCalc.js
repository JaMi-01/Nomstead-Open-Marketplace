'use client';
import { useMemo } from 'react';

/**
 * Calculates profit items and grouped profit
 * @param {object} grouped - grouped buy/sell data
 */
export default function useProfitCalc(grouped) {
  // Calculate all profitable item pairs
  const profitItems = useMemo(() => {
    const list = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => {
          if (!it.buyOffers?.length || !it.sellOffers?.length) return;

          const bestBuyer = it.sellOffers.reduce((a, b) =>
            a.unitPrice >= b.unitPrice ? a : b
          );

          const profitableSellers = it.buyOffers.filter(
            s => s.unitPrice < bestBuyer.unitPrice
          );

          profitableSellers.forEach(seller => {
            const profit = bestBuyer.unitPrice - seller.unitPrice;
            if (profit > 0.0001) {
              list.push({
                slug: it.slug,
                name: it.name,
                category: cat,
                subCategory: sub,
                type: it.type,
                image: it.image,
                buy: seller,
                sell: bestBuyer,
                profitPerUnit: profit
              });
            }
          });
        });
      });
    });
    return list.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped]);

  // Group profitable items by category/subcategory
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
