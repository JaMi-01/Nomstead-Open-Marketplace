'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Tabs from './components/Tabs';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import ProfitCard from './components/ProfitCard';

// helper: prettify slug -> Title Case and small reordering for common patterns
function prettifySlug(slug) {
  if (!slug) return '';
  const parts = slug.replace(/[-]/g, '_').split('_').filter(Boolean);
  const words = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  // small rule: if one of the words is 'Wood' and not first, move 'Wood' to front
  const wIdx = words.findIndex(w => w.toLowerCase() === 'wood');
  if (wIdx > 0) {
    const wood = words.splice(wIdx,1)[0];
    words.unshift(wood);
  }
  return words.join(' ');
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('Buy'); // 'Buy' | 'Sell' | 'Profit'
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [allItemsFlat, setAllItemsFlat] = useState([]); // for search suggestions
  const [cacheTs, setCacheTs] = useState(0);

  // fetch function with simple client-side caching (TTL 45s)
  const fetchData = async (force=false) => {
    try {
      setLoading(true);
      setError(null);
      const now = Date.now();
      if (!force && rawData && (now - cacheTs) < 45000) {
        setLoading(false);
        return;
      }
      const res = await fetch('https://api.nomstead.com/open/marketplace');
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      // data has toBuy and toSell arrays
      setRawData(data);
      setCacheTs(now);
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // transform raw data into grouped structure
  const grouped = useMemo(() => {
    if (!rawData) return {};
    // build map slug -> item object {slug,name,category,subCategory,image,buyOffers[],sellOffers[]}
    const map = {};
    const addEntry = (entry, type) => {
      const obj = entry.object || {};
      const slug = obj.slug || (entry.object && entry.object.slug) || 'unknown';
      const key = slug;
      if (!map[key]) {
        map[key] = {
          slug: key,
          name: prettifySlug(key),
          category: obj.category || 'Misc',
          subCategory: obj.subCategory || '',
          image: obj.imageUrl || obj.thumbnailImageUrl || '',
          buyOffers: [],
          sellOffers: []
        };
      }
      const target = {
        unitPrice: entry.pricing?.unitPrice ?? 0,
        quantity: (type === 'buy') ? (entry.pricing?.availableQuantity ?? 0) : (entry.pricing?.desiredQuantity ?? 0),
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || (entry.tile?.owner ?? 'kingdom')
      };
      if (type === 'buy') map[key].buyOffers.push(target);
      else map[key].sellOffers.push(target);
    };

    (rawData.toBuy || []).forEach(e => addEntry(e, 'buy'));
    (rawData.toSell || []).forEach(e => addEntry(e, 'sell'));

    // group by category -> subcategory
    const groupedByCategory = {};
    Object.values(map).forEach(item => {
      const cat = item.category || 'Misc';
      const sub = item.subCategory || 'General';
      if (!groupedByCategory[cat]) groupedByCategory[cat] = {};
      if (!groupedByCategory[cat][sub]) groupedByCategory[cat][sub] = [];
      groupedByCategory[cat][sub].push(item);
    });

    // build flat list for suggestions
    const flat = Object.values(map).map(it => ({
      slug: it.slug,
      name: it.name,
      category: it.category,
      subCategory: it.subCategory,
      image: it.image
    }));

    setAllItemsFlat(flat);
    return groupedByCategory;
  }, [rawData]);

  // compute profit items list
  const profitItems = useMemo(() => {
    if (!rawData) return [];
    const items = [];
    const entries = Object.values(grouped).flatMap(cat => Object.values(cat)).flat();
    // Actually grouped is {cat:{sub: [items]}} so flatten properly
    const flat = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => flat.push(it));
      });
    });
    flat.forEach(it => {
      const buys = (it.buyOffers || []).map(b => ({...b, unitPrice: Number(b.unitPrice)}));
      const sells = (it.sellOffers || []).map(s => ({...s, unitPrice: Number(s.unitPrice)}));
      if (!buys.length || !sells.length) return;
      const lowestBuy = buys.reduce((a,b) => a.unitPrice <= b.unitPrice ? a : b);
      const highestSell = sells.reduce((a,b) => a.unitPrice >= b.unitPrice ? a : b);
      const profit = highestSell.unitPrice - lowestBuy.unitPrice;
      if (profit > 0) {
        items.push({
          slug: it.slug,
          name: it.name,
          buyName: lowestBuy.kingdomName,
          buyLink: lowestBuy.kingdomUrl,
          buyPrice: lowestBuy.unitPrice,
          buyQty: lowestBuy.quantity,
          sellName: highestSell.kingdomName,
          sellLink: highestSell.kingdomUrl,
          sellPrice: highestSell.unitPrice,
          sellQty: highestSell.quantity,
          profitPerUnit: profit
        });
      }
    });
    return items.sort((a,b) => (b.profitPerUnit - a.profitPerUnit));
  }, [rawData, grouped]);

  // Expand / collapse helpers
  const expandAll = () => {
    const next = {};
    Object.keys(grouped).forEach(cat => { next[cat] = true; });
    setExpanded(next);
  };
  const collapseAll = () => setExpanded({});

  // build a small flat list for ItemCard mapping when showing a tab
  const listForTab = (tab) => {
    // tab: 'Buy' | 'Sell'
    const result = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => {
          // for each item, set viewType info
          const itemCopy = {
            slug: it.slug,
            name: it.name,
            image: it.image,
            category: it.category,
            subCategory: it.subCategory,
            buyOffers: it.buyOffers,
            sellOffers: it.sellOffers
          };
          result.push(itemCopy);
        });
      });
    });
    // For Buy tab sort by lowest unitPrice among buyOffers ascending
    if (tab === 'Buy') {
      result.sort((a,b) => {
        const aMin = a.buyOffers?.length ? Math.min(...a.buyOffers.map(x=>Number(x.unitPrice))) : Infinity;
        const bMin = b.buyOffers?.length ? Math.min(...b.buyOffers.map(x=>Number(x.unitPrice))) : Infinity;
        return aMin - bMin;
      });
    } else {
      // Sell: sort by highest sellOffers unitPrice descending
      result.sort((a,b) => {
        const aMax = a.sellOffers?.length ? Math.max(...a.sellOffers.map(x=>Number(x.unitPrice))) : -Infinity;
        const bMax = b.sellOffers?.length ? Math.max(...b.sellOffers.map(x=>Number(x.unitPrice))) : -Infinity;
        return bMax - aMax;
      });
    }
    return result;
  };

  // handle manual refresh
  const handleRefresh = () => fetchData(true);

  // render
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <SearchBar allItems={allItemsFlat} />
        <div className="flex gap-3 items-center">
          <button onClick={handleRefresh} className="px-3 py-2 bg-white border rounded">Refresh</button>
          <button onClick={expandAll} className="px-3 py-2 bg-green-100 rounded">Expand All</button>
          <button onClick={collapseAll} className="px-3 py-2 bg-yellow-100 rounded">Collapse All</button>
        </div>
      </div>

      <Tabs tabs={['Buy','Sell','Profit']} activeTab={activeTab} onChange={(t)=>setActiveTab(t)} />

      {loading && <div className="text-center text-gray-600">Loading marketplace...</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error loading marketplace</div>
          <div className="text-sm text-red-600">{error}</div>
          <div className="mt-2">
            <button onClick={handleRefresh} className="px-3 py-2 bg-red-100 rounded">Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'Profit' && (
        <div className="grid grid-cols-1 gap-4">
          {profitItems.length === 0 ? (
            <div className="text-center text-gray-600">No items with profit at the moment.</div>
          ) : (
            profitItems.map(p => <ProfitCard key={p.slug} item={{
              name: p.name,
              buyName: p.buyName,
              buyLink: p.buyLink,
              buyPrice: p.buyPrice,
              buyQty: p.buyQty,
              sellName: p.sellName,
              sellLink: p.sellLink,
              sellPrice: p.sellPrice,
              sellQty: p.sellQty
            }} />)
          )}
        </div>
      )}

      {!loading && !error && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => (
            <div key={cat} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold cursor-pointer" onClick={() => setExpanded(prev => ({...prev, [cat]: !prev[cat]}))}>
                  {expanded[cat] ? '▼' : '▶'} {cat}
                </h2>
                <div className="text-sm text-gray-500">{Object.keys(grouped[cat]).length} subcategories</div>
              </div>

              {expanded[cat] && (
                <div className="mt-4 space-y-4">
                  {Object.keys(grouped[cat]).map(sub => (
                    <div key={sub}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{sub}</h3>
                        <div className="text-sm text-gray-500">{grouped[cat][sub].length} items</div>
                      </div>

                      <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {grouped[cat][sub].map(it => (
                          <div key={it.slug}>
                            <ItemCard item={it} viewType={activeTab.toLowerCase()} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}