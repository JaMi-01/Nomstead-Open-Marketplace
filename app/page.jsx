'use client';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Tabs from './components/Tabs';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';

const ItemCard = dynamic(() => import('./components/ItemCard'), { ssr: false });
const ProfitCard = dynamic(() => import('./components/ProfitCard'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_NOMSTEAD_API || 'https://api.nomstead.com/open/marketplace';

function prettifySlug(slug) {
  if (!slug) return '';
  const parts = slug.replace(/[-]/g, '_').split('_').filter(Boolean);
  const words = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const wIdx = words.findIndex(w => w.toLowerCase() === 'wood');
  if (wIdx > 0) {
    const wood = words.splice(wIdx,1)[0];
    words.unshift(wood);
  }
  return words.join(' ');
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('Buy');
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [cacheTs, setCacheTs] = useState(0);
  const [allItemsFlat, setAllItemsFlat] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const now = Date.now();
      const cache = JSON.parse(localStorage.getItem('nom_cache') || 'null');
      if (!force && cache && (now - cache.ts < 15 * 60 * 1000)) {
        setRawData(cache.data);
        setCacheTs(cache.ts);
        setLoading(false);
        return;
      }

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      setRawData(data);
      setCacheTs(now);
      localStorage.setItem('nom_cache', JSON.stringify({ ts: now, data }));
      setLoading(false);
    } catch (e) {
      setError(e.message || 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const grouped = useMemo(() => {
    if (!rawData) return {};
    const map = {};
    const add = (entry, type) => {
      const obj = entry.object || {};
      const slug = obj.slug || 'unknown';
      if (!map[slug]) {
        map[slug] = {
          slug,
          name: prettifySlug(slug),
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

    (rawData.toBuy || []).forEach(e => add(e, 'buy'));
    (rawData.toSell || []).forEach(e => add(e, 'sell'));

    const groupedByCat = {};
    Object.values(map).forEach(it => {
      const cat = it.category || 'Misc';
      const sub = it.subCategory || 'General';
      if (!groupedByCat[cat]) groupedByCat[cat] = {};
      if (!groupedByCat[cat][sub]) groupedByCat[cat][sub] = [];
      groupedByCat[cat][sub].push(it);
    });

    const flat = Object.values(map).map(it => ({ slug: it.slug, name: it.name, category: it.category, subCategory: it.subCategory, image: it.image }));
    setAllItemsFlat(flat);
    return groupedByCat;
  }, [rawData]);

  const profitItems = useMemo(() => {
    if (!grouped) return [];
    const flat = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => flat.push(it));
      });
    });
    const items = [];
    flat.forEach(it => {
      if (!(it.buyOffers?.length) || !(it.sellOffers?.length)) return;
      // ensure both offers refer to the same slug and prefer same type - grouping by slug already ensures same item
      const lowestBuy = it.buyOffers.reduce((a,b) => a.unitPrice <= b.unitPrice ? a : b);
      const highestSell = it.sellOffers.reduce((a,b) => a.unitPrice >= b.unitPrice ? a : b);
      const profit = highestSell.unitPrice - lowestBuy.unitPrice;
      if (profit > 0) {
        items.push({
          slug: it.slug,
          name: it.name,
          buyOffers: it.buyOffers,
          sellOffers: it.sellOffers,
          profitPerUnit: profit
        });
      }
    });
    return items.sort((a,b) => b.profitPerUnit - a.profitPerUnit);
  }, [grouped]);

  const craftSellTop = useMemo(() => {
    if (!grouped) return [];
    const flat = [];
    Object.keys(grouped).forEach(cat => {
      Object.keys(grouped[cat]).forEach(sub => {
        grouped[cat][sub].forEach(it => flat.push(it));
      });
    });
    const list = [];
    flat.forEach(it => {
      const sells = (it.sellOffers || []).slice();
      if (!sells.length) return;
      const highestSell = sells.reduce((a,b) => a.unitPrice >= b.unitPrice ? a : b);
      list.push({
        slug: it.slug,
        name: it.name,
        highestSellPrice: highestSell.unitPrice,
        highestSellQty: highestSell.quantity,
        highestSellName: highestSell.kingdomName,
        highestSellLink: highestSell.kingdomUrl,
        image: it.image
      });
    });
    list.sort((a,b) => b.highestSellPrice - a.highestSellPrice);
    return list.slice(0, 100);
  }, [grouped]);

  const expandAll = () => {
    const next = {};
    Object.keys(grouped).forEach(cat => next[cat] = true);
    setExpandedCats(next);
  };
  const collapseAll = () => setExpandedCats({});

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center gap-4">
        <SearchBar allItemsFlat={allItemsFlat} />
        <div className="flex gap-3 items-center">
          <button onClick={() => fetchData(true)} className="px-3 py-2 bg-white border rounded">Refresh</button>
          <button onClick={() => setAutoRefresh(a => !a)} className={`px-3 py-2 rounded ${autoRefresh ? 'bg-green-100' : 'bg-gray-100'}`}>
            Auto refresh {autoRefresh ? 'on' : 'off'}
          </button>
          <button onClick={expandAll} className="px-3 py-2 bg-green-100 rounded">Expand All</button>
          <button onClick={collapseAll} className="px-3 py-2 bg-yellow-100 rounded">Collapse All</button>
        </div>
      </div>

      <Tabs tabs={['Buy','Sell','Profit']} activeTab={activeTab} onChange={setActiveTab} />

      {loading && <Loader />}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error loading marketplace</div>
          <div className="text-sm text-red-600">{error}</div>
          <div className="mt-2">
            <button onClick={() => fetchData(true)} className="px-3 py-2 bg-red-100 rounded">Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === 'Profit' && (
        <div className="space-y-6">
          {/* Buy low & Sell high */}
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
                  {profitItems.map(p => (
                    <ProfitCard key={p.slug} item={p} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Craft & Sell */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Craft & Sell</h2>
              <div className="text-sm text-gray-500">{craftSellTop.length} items</div>
            </div>
            <div className="mt-4">
              {craftSellTop.length === 0 ? (
                <div className="text-center text-gray-600">No sell items found.</div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {craftSellTop.map(it => (
                    <div key={it.slug} className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
                      <div className="flex gap-3 items-start">
                        <img src={it.image || '/placeholder.png'} alt={it.name} className="w-20 h-16 object-cover rounded"/>
                        <div className="flex-1">
                          <h3 className="font-semibold">{it.name}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            Sell to: <a href={it.highestSellLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">{it.highestSellName || 'kingdom'}</a>
                          </div>
                          <div className="text-sm text-gray-700 mt-2">
                            Unit Price: <span className="font-medium">{Number(it.highestSellPrice).toFixed(4)}</span> gold
                          </div>
                          <div className="text-sm text-gray-600">Qty: {it.highestSellQty}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => (
            <div key={cat} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-semibold flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => setExpandedCats(prev => ({...prev, [cat]: !prev[cat]}))}
                >
                  <span className={expandedCats[cat] ? 'rotate-90' : 'rotate-0'}>▶</span> {cat}
                </h2>
                <div className="text-sm text-gray-500">{Object.keys(grouped[cat]).length} subcategories</div>
              </div>

              {expandedCats[cat] && (
                <div className="mt-4 space-y-4">
                  {Object.keys(grouped[cat]).map(sub => (
                    <div key={sub}>
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-lg font-medium flex items-center gap-2 cursor-pointer"
                          onClick={() => setExpandedCats(prev => ({ ...prev, [`${cat}__${sub}`]: !prev[`${cat}__${sub}`] }))}
                        >
                          <span className={expandedCats[`${cat}__${sub}`] ? 'rotate-90' : 'rotate-0'}>▶</span> {sub}
                        </h3>
                        <div className="text-sm text-gray-500">{grouped[cat][sub].length} items</div>
                      </div>

                      {expandedCats[`${cat}__${sub}`] && (
                        <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {grouped[cat][sub].map(it => (
                            <ItemCard key={it.slug} item={it} viewType={activeTab.toLowerCase()} />
                          ))}
                        </div>
                      )}
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