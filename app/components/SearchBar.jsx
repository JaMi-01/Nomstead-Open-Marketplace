'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_NOMSTEAD_API || 'https://api.nomstead.com/open/marketplace';

export default function SearchBar({ allItemsFlat = [] }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        if (allItemsFlat && allItemsFlat.length) {
          const names = allItemsFlat.map(i => i.name || i.slug || '').filter(Boolean);
          const uniq = Array.from(new Set(names));
          const matches = uniq.filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0,8);
          if (mounted) setSuggestions(matches);
          return;
        }
        const res = await fetch(API);
        if (!res.ok) return;
        const j = await res.json();
        const items = [...(j.toBuy || []), ...(j.toSell || [])].map(i => i.object?.slug || '');
        const unique = Array.from(new Set(items)).map(s => prettify(s)).filter(Boolean);
        if (mounted) setSuggestions(unique.filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0,8));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [q, allItemsFlat]);

  const select = (s) => {
    setQ(s);
    setSuggestions([]);
    router.push(`/searchResults?q=${encodeURIComponent(s)}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q) return;
    setSuggestions([]);
    router.push(`/searchResults?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items (e.g. Wood Plank, Carrot)..."
          className="w-full p-3 border rounded shadow-sm bg-white"
        />
        {(suggestions.length > 0) && (
          <ul className="suggestion-list absolute left-0 right-0 mt-1 rounded max-h-56 overflow-auto">
            {suggestions.map((s, idx) => (
              <li key={idx} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => select(s)}>{s}</li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
}

function prettify(slug) {
  if (!slug) return '';
  const parts = slug.replace(/-/g,'_').split('_').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const idx = parts.findIndex(p => p.toLowerCase() === 'wood');
  if (idx > 0) {
    const wood = parts.splice(idx,1)[0];
    parts.unshift(wood);
  }
  return parts.join(' ');
}