'use client';
import { useMemo } from 'react';

/**
 * useCraftCalc
 * - Builds craftable items based on curated recipes and live market offers.
 * - For each recipe (target slug):
 *   * choose cheapest sellers per material (unit price as string)
 *   * compute craftable units based on all ingredient availabilities
 *   * choose best buyer for the crafted item
 *   * compute profit per unit = sellPrice - sum(materialQty * cheapestBuyPrice)
 * - Filters out non-profitable cases (numeric <= 0 and formatted <= 0)
 */
export default function useCraftCalc(grouped, recipes) {
  const craftItems = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];

    const list = [];

    // Helper: get all item entries by slug across grouped structure
    const getEntriesBySlug = (slug) => {
      const matches = [];
      Object.keys(grouped).forEach((cat) => {
        Object.keys(grouped[cat]).forEach((sub) => {
          grouped[cat][sub].forEach((it) => {
            if (it.slug === slug) matches.push({ cat, sub, it });
          });
        });
      });
      return matches;
    };

    recipes.forEach((r) => {
      const targetSlug = r.output.slug;
      const outputPerCraft = Number(r.output.quantity || 1);

      // Find all market entries that match the crafted target
      const targetEntries = getEntriesBySlug(targetSlug);
      if (!targetEntries.length) return;

      // Choose a representative entry (category/subcategory/name/image)
      // If multiple, the first is fine for grouping; sell offers will be merged below.
      const { cat, sub, it: targetIt } = targetEntries[0];

      // Aggregate all sell offers for the target, then pick best buyer
      const allSellOffers = targetEntries.flatMap((e) => e.it.sellOffers || []);
      if (!allSellOffers.length) return;
      const bestBuyer = allSellOffers.reduce((a, b) =>
        Number(a.unitPrice) >= Number(b.unitPrice) ? a : b
      );

      // For each ingredient find cheapest seller and its available quantity
      const chosenBuys = r.inputs.map((inp) => {
        const entries = getEntriesBySlug(inp.slug);
        const allBuyOffers = entries.flatMap((e) => e.it.buyOffers || []);
        if (!allBuyOffers.length) {
          return {
            slug: inp.slug,
            name: entries[0]?.it?.name || inp.slug,
            qtyPerCraft: Number(inp.quantity || 1),
            offer: null,
          };
        }
        // cheapest by numeric unit price
        const cheapest = allBuyOffers.reduce((a, b) =>
          Number(a.unitPrice) <= Number(b.unitPrice) ? a : b
        );
        return {
          slug: inp.slug,
          name: entries[0]?.it?.name || inp.slug,
          qtyPerCraft: Number(inp.quantity || 1),
          offer: cheapest, // keep unitPrice as string
        };
      });

      // If any ingredient is unavailable, skip
      if (chosenBuys.some((b) => !b.offer)) return;

      // Compute max craftable batches based on all ingredient quantities
      // Each batch produces `outputPerCraft` units of the target
      const maxBatches = Math.min(
        ...chosenBuys.map((b) => {
          const availableUnits = Number(b.offer.quantity || 0);
          const perBatchNeed = b.qtyPerCraft;
          if (perBatchNeed <= 0) return 0;
          return Math.floor(availableUnits / perBatchNeed);
        })
      );
      if (maxBatches <= 0) return;

      // Determine decimals from the sell price (for consistent formatting)
      const sellPriceStr = bestBuyer.unitPrice?.toString() ?? '0';
      const decimals = sellPriceStr.includes('.')
        ? sellPriceStr.split('.')[1].length
        : 0;

      // Compute unit economics
      const materialCostPerOutputUnit = chosenBuys
        .reduce((sum, b) => {
          const perBatchCost =
            Number(b.offer.unitPrice) * b.qtyPerCraft;
          return sum + perBatchCost;
        }, 0) / outputPerCraft;

      const sellPriceNum = Number(sellPriceStr);
      const profitPerUnitNum = sellPriceNum - materialCostPerOutputUnit;

      // Skip zero/negative profit
      if (profitPerUnitNum <= 0) return;
      const profitPerUnitStr = profitPerUnitNum.toFixed(decimals);
      if (Number(profitPerUnitStr) <= 0) return;

      // Craftable total units (bounded by target buyer desired quantity)
      const craftedUnits = maxBatches * outputPerCraft;
      const maxTradable = Math.min(craftedUnits, Number(bestBuyer.quantity || 0));

      list.push({
        slug: targetIt.slug,
        name: targetIt.name,
        category: cat,
        subCategory: sub,
        type: targetIt.type,
        image: targetIt.image,
        materials: chosenBuys,       // [{slug, name, qtyPerCraft, offer:{unitPrice(str), quantity, kingdom...}}]
        outputPerCraft,
        sell: bestBuyer,             // {unitPrice(str), quantity, kingdom...}
        profitPerUnit: profitPerUnitNum,
        profitPerUnitStr,            // formatted with sell decimals
        profitDecimals: decimals,
        maxTradable                   // cap total slider
      });
    });

    // Sort by numeric profit desc
    return list.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped, recipes]);

  // Group craft items by category/subcategory for UI
  const groupedCraft = useMemo(() => {
    const map = {};
    craftItems.forEach((p) => {
      const cat = p.category || 'Misc';
      const sub = p.subCategory || 'General';
      map[cat] ??= {};
      map[cat][sub] ??= [];
      map[cat][sub].push(p);
    });
    return map;
  }, [craftItems]);

  return { craftItems, groupedCraft };
}
