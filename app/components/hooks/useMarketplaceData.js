'use client';
import { useEffect, useState } from 'react';
import { detectType, groupItems } from './helpers';
import useProfitCalc from './useProfitCalc';

const API = 'https://api.nomstead.com/open/marketplace';

export default function useMarketplaceData(activeTab, query) {
  const [raw, setRaw] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [minutesAgo, setMinutesAgo] = useState(null);

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

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const diffMs = Date.now() - lastUpdated.getTime();
      setMinutesAgo(Math.floor(diffMs / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Override groupItems locally so we can inject raw strings
  function safeGroupItems(rawData) {
    const grouped = {};
    const add = (entry, type) => {
      const obj = entry.object || {};
      const slug = obj.slug || 'unknown';
      const category = obj.category || 'Misc';
      const sub = obj.subCategory || 'General';
      const detectedType = detectType(category, slug);
      const key = `${slug}_${detectedType}`;
      if (!grouped[key]) {
        grouped[key] = {
          slug,
          name: obj.metadata?.title || slug,
          category,
          subCategory: sub,
          type: detectedType,
          image: obj.imageUrl || obj.thumbnailImageUrl || '',
          buyOffers: [],
          sellOffers: []
        };
      }

      const offer = {
        // 👇 keep as string to preserve exact decimals
        unitPrice: entry.pricing?.unitPrice?.toString() ?? '0',
        quantity:
          type === 'buy'
            ? Number(entry.pricing?.availableQuantity ?? 0)
            : Number(entry.pricing?.desiredQuantity ?? 0),
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || 'kingdom'
      };

      if (type === 'buy') grouped[key].buyOffers.push(offer);
      else grouped[key].sellOffers.push(offer);
    };

    (rawData.toBuy || []).forEach(e => add(e, 'buy'));
    (rawData.toSell || []).forEach(e => add(e, 'sell'));

    const byCat = {};
    Object.values(grouped).forEach(it => {
      const cat = it.category || 'Misc';
      const sub = it.subCategory || 'General';
      byCat[cat] ??= {};
      byCat[cat][sub] ??= [];
      byCat[cat][sub].push(it);
    });
    return byCat;
  }

  const grouped = safeGroupItems(raw);
  const { profitItems, groupedProfit } = useProfitCalc(grouped);

  // Auto-expand on search (unchanged)
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