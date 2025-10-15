'use client';
import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import Tabs from './components/Tabs';
import ItemCard from './components/ItemCard';
import ProfitCard from './components/ProfitCard';
import Loader from './components/Loader';

const API = process.env.NEXT_PUBLIC_NOMSTEAD_API || 'https://api.nomstead.com/open/marketplace';

function prettify(slug) {
  if (!slug) return '';
  const parts = slug.replace(/-/g,'_').split('_').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));
  // move 'Wood' to front if not first, e.g. plank_wood -> Wood Plank
  const idx = parts.findIndex(p => p.toLowerCase() === 'wood');
  if (idx > 0) {
    const wood = parts.splice(idx,1)[0];
    parts.unshift(wood);
  }
  return parts.join(' ');
}

export default function HomePage() {
  const [raw, setRaw] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Buy');
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API);
      if (!res.ok) throw new Error('API ' + res.status);
      const j = await res.json();
      setRaw({ toBuy: j.toBuy || [], toSell: j.toSell || [] });
    } catch (e) {
      console.error(e);
      setError('Could not fetch marketplace data.');
      setRaw({ toBuy: [], toSell: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, 5*60*1000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // group into { category: { subCategory: [item,...] } }
  const grouped = useMemo(() => {
    const map = {};
    const add = (entry, type) => {
      const obj = entry.object || {};
      const slug = obj.slug || obj.metadata || 'unknown';
      if (!map[slug]) {
        map[slug] = {
          slug,
          name: prettify(slug),
          category: obj.category || 'Misc',
          subCategory: obj.subCategory || 'General',
          image: obj.imageUrl || obj.thumbnailImageUrl || '',
          buyOffers: [],
          sellOffers: []
        };
      }
      const offer = {
        unitPrice: Number(entry.pricing?.unitPrice ?? 0),
        quantity: type === 'buy' ? Number(entry.pricing?.availableQuantity ?? 0) : Number(entry.pricing?.desiredQuantity ?? 0),
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || 'kingdom'
      };
      if (type === 'buy') map[slug].buyOffers.push(offer);
      else map[slug].sellOffers.push(offer);
    };

    (raw.toBuy || []).forEach(e => add(e,'buy'));
    (raw.toSell || []).forEach(e => add(e,'sell'));

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

  // profit items: match same slug with lowest buy and highest sell
  const profitItems = useMemo(() => {
    const flat = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => flat.push(it));
      });
    });
    const res = [];
    flat.forEach(it => {
      if (!it.buyOffers?.length || !it.sellOffers?.length) return;
      const lowestBuy = it.buyOffers.reduce((a,b) => a.unitPrice <= b.unitPrice ? a : b);
      const highestSell = it.sellOffers.reduce((a,b) => a.unitPrice >= b.unitPrice ? a : b);
      const profit = highestSell.unitPrice - lowestBuy.unitPrice;
      if (profit > 0) res.push({ slug: it.slug, name: it.name, buy: lowestBuy, sell: highestSell, image: it.image, profitPerUnit: profit });
    });
    return res.sort((a,b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped]);

  // search behavior: when query set and activeTab is Buy/Sell expand categories/subcategories that contain matches
  useEffect(() => {
    if (!query || activeTab === 'Profit') {
      // if clearing query, collapse nothing (keep previous) — you can change to collapseAll if desired
      return;
    }
    const next = {};
    Object.keys(grouped).forEach(cat => {
      let catHas = false;
      Object.keys(grouped[cat]).forEach(sub => {
        const matches = grouped[cat][sub].filter(it => {
          const q = query.toLowerCase();
          return it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q) || (it.category+' '+it.subCategory).toLowerCase().includes(q);
        });
        if (matches.length) {
          next[`${cat}__${sub}`] = true;
          catHas = true;
        }
      });
      if (catHas) next[cat] = true;
    });
    setExpanded(prev => ({...prev, ...next}));
  }, [query, grouped, activeTab]);

  const expandAll = () => {
    const next = {};
    Object.keys(grouped).forEach(cat => {
      next[cat] = true;
      Object.keys(grouped[cat]).forEach(sub => next[`${cat}__${sub}`] = true);
    });
    setExpanded(next);
  };
  const collapseAll = () => setExpanded({});

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center gap-4">
        <SearchBar onSearch={setQuery} currentTab={activeTab} allGrouped={grouped} />
        <div className="flex gap-3 items-center">
          <button onClick={fetchData} className="px-3 py-2 bg-white border rounded">Refresh</button>
          <button onClick={() => setAutoRefresh(a=>!a)} className={`px-3 py-2 rounded ${autoRefresh ? 'bg-green-100' : 'bg-gray-100'}`}>
            Auto refresh {autoRefresh ? 'on' : 'off'}
          </button>
          <button onClick={expandAll} className="px-3 py-2 bg-green-100 rounded">Expand All</button>
          <button onClick={collapseAll} className="px-3 py-2 bg-yellow-100 rounded">Collapse All</button>
        </div>
      </div>

      <Tabs tabs={['Buy','Sell','Profit']} activeTab={activeTab} setActiveTab={setActiveTab} />

      {loading && <Loader />}

      {!loading && activeTab === 'Profit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Buy low & Sell high</h2>
              <div className="text-sm text-gray-500">{profitItems.length} items</div>
            </div>

            <div className="mt-4">
              {profitItems.length === 0 ? (
                <div className="text-center text-gray-600">No items with profit at the moment.</div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {profitItems.map(p => <ProfitCard key={p.slug} item={p} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => (
            <section key={cat} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(prev => ({...prev, [cat]: !prev[cat]}))}>
                  <span className={`triangle ${expanded[cat] ? 'open' : ''}`}>▶</span> {cat}
                </h2>
                <div className="text-sm text-gray-500">{Object.keys(grouped[cat]).length} subcategories</div>
              </div>

              {expanded[cat] && (
                <div className="mt-4 space-y-4">
                  {Object.keys(grouped[cat]).map(sub => {
                    // compute filtered items when query exists
                    const itemsList = grouped[cat][sub].filter(it => {
                      if (!query) return true;
                      const q = query.toLowerCase();
                      return it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q) || (it.category+' '+it.subCategory).toLowerCase().includes(q);
                    });
                    if (!itemsList.length) return null;
                    return (
                      <div key={sub}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(prev => ({...prev, [`${cat}__${sub}`]: !prev[`${cat}__${sub}`]}))}>
                            <span className={`triangle ${expanded[`${cat}__${sub}`] ? 'open' : ''}`}>▶</span> {sub}
                          </h3>
                          <div className="text-sm text-gray-500">{itemsList.length} items</div>
                        </div>

                        {expanded[`${cat}__${sub}`] && (
                          <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {itemsList.map(it => <ItemCard key={it.slug} item={it} viewType={activeTab.toLowerCase()} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
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
