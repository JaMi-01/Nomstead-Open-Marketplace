'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tabs from './components/Tabs';
import ItemCard from './components/ItemCard';
import SearchBar from './components/SearchBar';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') || '';
  const [activeTab, setActiveTab] = useState('Buy');
  const [data, setData] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('https://api.nomstead.com/open/marketplace')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    if (!data) return;
    // transform to items like in page.jsx
    const map = {};
    const add = (entry, type) => {
      const slug = entry.object?.slug || 'unknown';
      if (!map[slug]) {
        map[slug] = {
          slug,
          name: (slug || '').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          image: entry.object?.imageUrl || entry.object?.thumbnailImageUrl || '',
          category: entry.object?.category || 'Misc',
          subCategory: entry.object?.subCategory || '',
          buyOffers: [],
          sellOffers: []
        };
      }
      const obj = {
        unitPrice: entry.pricing?.unitPrice || 0,
        quantity: (type === 'buy') ? entry.pricing?.availableQuantity : entry.pricing?.desiredQuantity,
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || 'kingdom'
      };
      if (type === 'buy') map[slug].buyOffers.push(obj);
      else map[slug].sellOffers.push(obj);
    };
    (data.toBuy || []).forEach(e => add(e, 'buy'));
    (data.toSell || []).forEach(e => add(e, 'sell'));

    const arr = Object.values(map);
    const qLower = q.toLowerCase();
    const filteredItems = arr.filter(i => i.name.toLowerCase().includes(qLower));
    setFiltered(filteredItems);
  }, [data, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <SearchBar allItems={[]} />
      </div>

      <div className="flex justify-center">
        <button onClick={() => router.push('/')} className="px-3 py-2 bg-white border rounded">Back to homepage</button>
      </div>

      <Tabs tabs={['Buy','Sell']} activeTab={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <div className="text-center text-gray-600">No results found for <strong>{q}</strong></div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(it => <ItemCard key={it.slug} item={it} viewType={activeTab.toLowerCase()} />)}
        </div>
      )}
    </div>
  );
}