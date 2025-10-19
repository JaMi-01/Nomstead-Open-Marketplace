'use client';
import { useEffect, useState } from 'react';
import { prettify, detectType, groupItems } from './helpers';
import useProfitCalc from './useProfitCalc';

const API = 'https://api.nomstead.com/open/marketplace';

/**
 * Main hook controlling marketplace state and logic
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

  /** Initial fetch */
  useEffect(() => { fetchData(); }, []);

  /** Update time counter */
  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const diffMs = Date.now() - lastUpdated.getTime();
      setMinutesAgo(Math.floor(diffMs / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  /** Grouping of marketplace data */
  const grouped = groupItems(raw, prettify, detectType);

  /** Profit calculations */
  const { profitItems, groupedProfit } = useProfitCalc(grouped);

  /** Auto-expand search matches (Buy/Sell only) */
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

  /** Expand/Collapse helpers */
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
