'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tabs from '../components/Tabs';
import dynamic from 'next/dynamic';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';

const ItemCard = dynamic(() => import('../components/ItemCard'), { ssr: false });

function prettifySlug(slug) {
  if (!slug) return '';
  return slug.replace(/[-]/g,'_').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') || '';
  const [activeTab, setActiveTab] = useState('Buy');
  const [data, setData] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_NOMSTEAD_API || 'https://api.nomstead.com/open/marketplace';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then(r => {
        if (!r.ok) throw new Error('API returned ' + r.status);
        return r.json();
      })
      .then(d => setData(d))
      .catch((e) => {
        console.error('Search API error', e);
        setError('Could not fetch marketplace');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    if (!data) return setFiltered([]);
    const map = {};
    const add = (entry, type) => {
      const slug = entry.object?.slug || 'unknown';
      if (!map[slug]) {
        map[slug] = {
          slug,
          name: prettifySlug(slug),
          image: entry.object?.imageUrl || entry.object?.thumbnailImageUrl || '',
          category: entry.object?.category || 'Misc',
          subCategory: entry.object?.subCategory || '',
          buyOffers: [],
          sellOffers: []
        };
      }
      const o = {
        unitPrice: Number(entry.pricing?.unitPrice || 0),
        quantity: type === 'buy' ? Number(entry.pricing?.availableQuantity || 0) : Number(entry.pricing?.desiredQuantity || 0),
        kingdomUrl: entry.tile?.url || '#',
        kingdomName: entry.tile?.owner || 'kingdom'
      };
      if (type === 'buy') map[slug].buyOffers.push(o);
      else map[slug].sellOffers.push(o);
    };
    (data.toBuy || []).forEach(e => add(e, 'buy'));
    (data.toSell || []).forEach(e => add(e, 'sell'));
    const arr = Object.values(map);
    const qLower = q.toLowerCase();
    const filteredItems = arr.filter(i => i.name.toLowerCase().includes(qLower));
    setFiltered(filteredItems);
  }, [data, q]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center">
        <SearchBar allItemsFlat={[]} />
      </div>

      <div className="flex justify-center">
        <button onClick={() => router.push('/')} className="px-3 py-2 bg-white border rounded">← Back to homepage</button>
      </div>

      <div className="flex justify-center">
        <Tabs tabs={['Buy','Sell']} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {loading && <Loader />}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
          <div className="font-semibold text-red-700">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-gray-600">No results found for <strong>{q}</strong></div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(it => <ItemCard key={it.slug} item={it} viewType={activeTab.toLowerCase()} />)}
        </div>
      )}
    </div>
  );
}