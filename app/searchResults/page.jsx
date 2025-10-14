'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tabs from '../components/Tabs';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';

const API = process.env.NEXT_PUBLIC_NOMSTEAD_API || 'https://api.nomstead.com/open/marketplace';

function prettifySlug(slug) {
  if (!slug) return '';
  return slug.replace(/[-]/g,'_').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q') || '';
  const [activeTab, setActiveTab] = useState('Buy');
  const [loading, setLoading] = useState(true);
  const [filteredBuy, setFilteredBuy] = useState([]);
  const [filteredSell, setFilteredSell] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) {
      router.push('/');
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('API ' + res.status);
        const j = await res.json();
        const buy = (j.toBuy || []).filter(i => {
          const slug = (i.object?.slug || '').replace(/_/g,' ').toLowerCase();
          return slug.includes(q.toLowerCase()) || (i.object?.metadata || '').toLowerCase().includes(q.toLowerCase());
        });
        const sell = (j.toSell || []).filter(i => {
          const slug = (i.object?.slug || '').replace(/_/g,' ').toLowerCase();
          return slug.includes(q.toLowerCase()) || (i.object?.metadata || '').toLowerCase().includes(q.toLowerCase());
        });
        setFilteredBuy(buy);
        setFilteredSell(sell);
      } catch (e) {
        console.error(e);
        setError('Could not fetch marketplace');
      } finally {
        setLoading(false);
      }
    })();
  }, [q, router]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col items-center gap-4">
        <SearchBar />
        <div className="w-full flex justify-center">
          <button onClick={() => router.push('/')} className="px-3 py-2 bg-white border rounded">← Back to homepage</button>
        </div>
      </div>

      <Tabs tabs={['Buy','Sell']} activeTab={activeTab} setActiveTab={setActiveTab} />

      {loading && <Loader />}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-center text-red-600">{error}</div>
      )}

      {!loading && !error && activeTab === 'Buy' && filteredBuy.length === 0 && (
        <div className="text-center text-gray-600">No results found for <strong>{q}</strong></div>
      )}

      {!loading && !error && activeTab === 'Sell' && filteredSell.length === 0 && (
        <div className="text-center text-gray-600">No results found for <strong>{q}</strong></div>
      )}

      {!loading && !error && activeTab === 'Buy' && filteredBuy.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBuy.map((it, idx) => <ItemCard key={it.object.slug + idx} item={it} viewType="buy" />)}
        </div>
      )}

      {!loading && !error && activeTab === 'Sell' && filteredSell.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSell.map((it, idx) => <ItemCard key={it.object.slug + idx} item={it} viewType="sell" />)}
        </div>
      )}
    </div>
  );
}