'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ allItemsFlat = [] }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem('nom_recent_searches') || '[]');
    setRecent(rec.slice(0,3));
  }, []);

  useEffect(() => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      return;
    }
    const lower = q.toLowerCase();
    const uniqueNames = Array.from(new Set(allItemsFlat.map(i => i.name)));
    const matches = uniqueNames.filter(n => n.toLowerCase().includes(lower)).slice(0, 8);
    setSuggestions(matches);
  }, [q, allItemsFlat]);

  const goSearch = (term) => {
    if (!term) return;
    setQ(term);
    setSuggestions([]);
    const rec = JSON.parse(localStorage.getItem('nom_recent_searches') || '[]');
    const next = [term, ...rec.filter(r => r !== term)].slice(0, 5);
    localStorage.setItem('nom_recent_searches', JSON.stringify(next));
    router.push(`/searchResults?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto sticky-top">
      <div className="relative">
        <input
          type="text"
          placeholder="Search items (e.g. Wood Plank, Carrot)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goSearch(q)}
          className="w-full p-3 border rounded shadow-sm bg-white"
        />
        {(suggestions.length > 0 || recent.length > 0) && (
          <ul className="suggestion-list absolute left-0 right-0 bg-white border mt-1 rounded max-h-56 overflow-auto">
            {suggestions.map(s => (
              <li key={s} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => goSearch(s)}>
                {s}
              </li>
            ))}
            {recent.length > 0 && <li className="px-3 py-2 text-xs text-gray-500">Recent:</li>}
            {recent.map(r => (
              <li key={r} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => goSearch(r)}>
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
