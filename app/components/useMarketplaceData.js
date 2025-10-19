'use client';
import { useEffect, useMemo, useState } from 'react';

const API = 'https://api.nomstead.com/open/marketplace';

/** Helper: prettify slug for display fallback */
function prettify(slug) {
  if (!slug) return '';
  const parts = slug.replace(/-/g, '_').split('_').filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/** Helper: detect item type */
function detectType(category, slug) {
  const c = category?.toLowerCase() || '';
  const s = slug?.toLowerCase() || '';
  if (c.includes('recipe') || s.includes('recipe')) return 'recipe';
  if (c.includes('seed') || s.includes('seed')) return 'seed';
  if (c.includes('resource') || s.includes('resource')) return 'resource';
  if (c.includes('material') || s.includes('material')) return 'material';
  return 'object';
}

/**
 * Custom hook — handles fetching, grouping, profit calc and expand logic
 */
export default function useMarketplaceData(activeTab, query) {
  const [raw, setRaw] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [minutesAgo, setMinutesAgo] = useState(null);

  /** Fetch data from API */
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error('API ' + res.status);
      const j = await res.json();
      setRaw({ toBuy: j.toBuy || [], toSell: j.toSell || [] });
      setLastUpdated(new Date());
      setMinutesAgo(0);
    } catch (e) {
      console.error(e);
      setError('Could not fetch marketplace data.');
      setRaw({ toBuy: [], toSell: [] });
    } finally {
      setLoading(false);
    }
  }

  /** Fetch once on mount */
  useEffect(() => { fetchData(); }, []);

  /** Update "minutes ago" display */
  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const diffMs = Date.now() - lastUpdated.getTime();
      setMinutesAgo(Math.floor(diffMs / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  /** Group items by category/subcategory */
  const grouped = useMemo(() => {
    const map = {};
    const add = (entry, type) => {
      const obj = entry.object || {};
      const slug = obj.slug || obj.metadata || 'unknown';
      const category = obj.category || 'Misc';
      const sub = obj.subCategory || 'General';
      const detectedType = detectType(category, slug);
      const key = `${slug}_${detectedType}`;
      if (!map[key]) {
        map[key] = {
          slug,
          name: prettify(slug),
          category,
          subCategory: sub,
          type: detectedType,
          image: obj.imageUrl || obj.thumbnailImageUrl || '',
          buyOffers: [],
          sellOffers: []
        };
      }
      const offer = {
        unitPrice: Number(entry.pricing?.unitPrice ?? 0),
        quantity:
          type === 'buy'
            ? Number(entry.pricing?.availableQuantity ?? 0)
            : Number(entry.pricing?.desiredQuantity ?? 0),
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || 'kingdom'
      };
      if (type === 'buy') map[key].buyOffers.push(offer);
      else map[key].sellOffers.push(offer);
    };

    (raw.toBuy || []).forEach(e => add(e, 'buy'));
    (raw.toSell || []).forEach(e => add(e, 'sell'));

    const byCat = {};
    Object.values(map).forEach(it => {
      const cat = it.category || 'Misc';
      const sub = it.subCategory || 'General';
      byCat[cat] ??= {};
      byCat[cat][sub] ??= [];
      byCat[cat][sub].push(it);
    });
    return byCat;
  }, [raw]);

  /** Profit logic */
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

  /** Auto-expand on search for Buy/Sell */
  useEffect(() => {
    if (!query || activeTab === 'Profit') return;
    const next = {};
    Object.keys(grouped).forEach(cat => {
      let catHasMatch = false;
      Object.keys(grouped[cat]).forEach(sub => {
        const hasMatch = grouped[cat][sub].some(it => {
          const q = query.toLowerCase();
          return (
            it.name.toLowerCase().includes(q) ||
            it.slug.toLowerCase().includes(q) ||
            it.category.toLowerCase().includes(q) ||
            it.subCategory.toLowerCase().includes(q)
          );
        });
        if (hasMatch) {
          next[`${cat}__${sub}`] = true;
          catHasMatch = true;
        }
      });
      if (catHasMatch) next[cat] = true;
    });
    setExpanded(prev => ({ ...prev, ...next }));
  }, [query, grouped, activeTab]);

  /** Expand / collapse helpers */
  const expandAll = () => {
    const next = {};
    Object.keys(grouped).forEach(cat => {
      next[cat] = true;
      Object.keys(grouped[cat]).forEach(sub => (next[`${cat}__${sub}`] = true));
    });
    setExpanded(next);
  };
  const collapseAll = () => setExpanded({});

  return {
    loading,
    error,
    grouped,
    profitItems,
    groupedProfit,
    expanded,
    setExpanded,
    fetchData,
    expandAll,
    collapseAll,
    lastUpdated,
    minutesAgo
  };
}
