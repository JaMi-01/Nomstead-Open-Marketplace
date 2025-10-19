'use client';
import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar';
import Tabs from './Tabs';
import Loader from './Loader';
import ProfitView from './ProfitView';
import CategorySection from './CategorySection';

const API = 'https://api.nomstead.com/open/marketplace';

/** Helper: Prettify slug for fallback display */
function prettify(slug) {
  if (!slug) return '';
  const parts = slug.replace(/-/g, '_').split('_').filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/** Helper: Detect item type for grouping consistency */
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
 * Main marketplace view — handles fetch, tabs, grouping, expand logic
 */
export default function MarketplaceView() {
  const [raw, setRaw] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Buy');
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
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

  /** Update "Last updated X min ago" */
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

  /** Profit logic — same as 4.3 */
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

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Search and controls */}
      <div className="flex flex-col items-center gap-3">
        <SearchBar onSearch={setQuery} currentTab={activeTab} allGrouped={grouped} />
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-3 items-center">
            <button onClick={fetchData} className="px-3 py-2 bg-white border rounded">Refresh</button>
            <button onClick={expandAll} className="px-3 py-2 bg-green-100 rounded">Expand All</button>
            <button onClick={collapseAll} className="px-3 py-2 bg-yellow-100 rounded">Collapse All</button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">Last updated {minutesAgo ?? 0} min ago</p>
          )}
        </div>
      </div>

      <Tabs tabs={['Buy','Sell','Profit']} activeTab={activeTab} setActiveTab={setActiveTab} />
      {loading && <Loader />}

      {!loading && activeTab === 'Profit' && (
        <ProfitView groupedProfit={groupedProfit} profitItems={profitItems} />
      )}

      {!loading && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => (
            <CategorySection
              key={cat}
              cat={cat}
              grouped={grouped}
              query={query}
              expanded={expanded}
              setExpanded={setExpanded}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}
