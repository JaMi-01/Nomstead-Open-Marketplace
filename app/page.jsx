'use client';
import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import Tabs from './components/Tabs';
import ItemCard from './components/ItemCard';
import ProfitCard from './components/ProfitCard';
import Loader from './components/Loader';

const API = 'https://api.nomstead.com/open/marketplace';

function prettify(slug) {
  if (!slug) return '';
  const parts = slug
    .replace(/-/g, '_')
    .split('_')
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const idx = parts.findIndex(p => p.toLowerCase() === 'wood');
  if (idx > 0) {
    const wood = parts.splice(idx, 1)[0];
    parts.unshift(wood);
  }
  return parts.join(' ');
}

function detectType(category, slug) {
  const c = category?.toLowerCase() || '';
  const s = slug?.toLowerCase() || '';
  if (c.includes('recipe') || s.includes('recipe')) return 'recipe';
  if (c.includes('seed') || s.includes('seed')) return 'seed';
  if (c.includes('resource') || s.includes('resource')) return 'resource';
  if (c.includes('material') || s.includes('material')) return 'material';
  return 'object';
}

export default function HomePage() {
  const [raw, setRaw] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Buy');
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const diffMs = Date.now() - lastUpdated.getTime();
      setMinutesAgo(Math.floor(diffMs / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // --- Grouping ---
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

  // --- ✅ Correct Profit logic: Buy from cheapest seller, sell to best buyer ---
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
            // filtrer direkte her
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

  // --- Search auto-expand ---
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

  // --- Render ---
  return (
    <div className="space-y-6 pb-12">
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

      {/* PROFIT TAB */}
      {!loading && activeTab === 'Profit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Buy Low & Sell High</h2>
              <div className="text-sm text-gray-500">{profitItems.length} items</div>
            </div>
            <div className="mt-4 space-y-6">
              {Object.keys(groupedProfit).length === 0 ? (
                <div className="text-center text-gray-600">
                  No items with profit at the moment.
                </div>
              ) : (
                Object.keys(groupedProfit).map(cat => (
                  <section key={cat} className="bg-white rounded-lg p-4 shadow-sm">
                    <h2 className="text-xl font-semibold">{cat}</h2>
                    {Object.keys(groupedProfit[cat]).map(sub => (
                      <div key={sub} className="mt-3">
                        <h3 className="text-lg font-medium">{sub}</h3>
                        <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedProfit[cat][sub].map(p => (
                            <ProfitCard key={`${p.slug}-${p.sell.kingdomName}-${p.buy.kingdomName}`} item={p} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BUY & SELL TABS */}
      {!loading && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => {
            const visibleSubs = Object.keys(grouped[cat]).filter(sub => {
              const filteredItems = grouped[cat][sub].filter(it => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  it.name.toLowerCase().includes(q) ||
                  it.slug.toLowerCase().includes(q)
                );
              });
              return filteredItems.length > 0;
            });
            if (visibleSubs.length === 0) return null;

            return (
              <section key={cat} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-semibold flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))}
                  >
                    <span className={`triangle ${expanded[cat] ? 'open' : ''}`}>▶</span> {cat}
                  </h2>
                  <div className="text-sm text-gray-500">{visibleSubs.length} subcategories</div>
                </div>

                {expanded[cat] && (
                  <div className="mt-4 space-y-4">
                    {visibleSubs.map(sub => {
                      const items = grouped[cat][sub].filter(it => {
                        if (!query) return true;
                        const q = query.toLowerCase();
                        return (
                          it.name.toLowerCase().includes(q) ||
                          it.slug.toLowerCase().includes(q)
                        );
                      });
                      if (!items.length) return null;

                      const totalOffers = items.reduce((sum, it) => {
                        const offers =
                          activeTab === 'Buy'
                            ? it.buyOffers?.length || 0
                            : it.sellOffers?.length || 0;
                        return sum + offers;
                      }, 0);

                      return (
                        <div key={sub}>
                          <div className="flex justify-between items-center">
                            <h3
                              className="text-lg font-medium flex items-center gap-2 cursor-pointer"
                              onClick={() =>
                                setExpanded(prev => ({
                                  ...prev,
                                  [`${cat}__${sub}`]: !prev[`${cat}__${sub}`]
                                }))
                              }
                            >
                              <span className={`triangle ${expanded[`${cat}__${sub}`] ? 'open' : ''}`}>▶</span> {sub}
                            </h3>
                            <div className="text-sm text-gray-500">{totalOffers} items</div>
                          </div>

                          {expanded[`${cat}__${sub}`] && (
                            <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                              {items.map(it => {
                                const offers =
                                  activeTab === 'Buy'
                                    ? it.buyOffers.slice().sort((a,b)=>a.unitPrice - b.unitPrice)
                                    : it.sellOffers.slice().sort((a,b)=>b.unitPrice - a.unitPrice);
                                return offers.map((offer, idx) => (
                                  <ItemCard
                                    key={`${it.slug}-${idx}`}
                                    item={{ ...it, singleOffer: offer }}
                                    viewType={activeTab.toLowerCase()}
                                  />
                                ));
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
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