'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ allItemsFlat = [] }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!q || q.length < 1) return setSuggestions([]);
    const lower = q.toLowerCase();
    const uniqueNames = Array.from(new Set(allItemsFlat.map(i => i.name)));
    const matches = uniqueNames.filter(n => n.toLowerCase().includes(lower)).slice(0, 7);
    setSuggestions(matches);
  }, [q, allItemsFlat]);

  const goSearch = (term) => {
    setQ(term);
    setSuggestions([]);
    router.push(`/searchResults?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search items (e.g. Wood Plank, Carrot)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goSearch(q)}
          className="w-full p-3 border rounded shadow-inner"
        />
        {suggestions.length > 0 && (
          <ul className="suggestion-list absolute left-0 right-0 bg-white border mt-1 rounded max-h-52 overflow-auto">
            {suggestions.map(s => (
              <li key={s} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => goSearch(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}