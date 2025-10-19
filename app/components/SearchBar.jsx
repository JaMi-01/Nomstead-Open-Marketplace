'use client';
import React, { useEffect, useState } from 'react';

/**
 * SearchBar (v4.4.3)
 * - Uses metadata.title for suggestions and search matching
 */
export default function SearchBar({ onSearch = () => {}, currentTab = 'Buy', allGrouped = {} }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!q || q.length < 1) {
      setSuggestions([]);
      return;
    }

    const ql = q.toLowerCase();
    const names = [];

    Object.keys(allGrouped).forEach(cat => {
      Object.keys(allGrouped[cat]).forEach(sub => {
        allGrouped[cat][sub].forEach(it => {
          if (!it.name) return;
          if (it.name.toLowerCase().includes(ql) || it.slug.toLowerCase().includes(ql)) {
            names.push(it.name); // metadata.title
          }
        });
      });
    });

    const uniq = Array.from(new Set(names)).slice(0, 10);
    setSuggestions(uniq);
  }, [q, allGrouped]);

  const handleSelect = (s) => {
    setQ(s);
    setSuggestions([]);
    onSearch(s);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(q);
    setSuggestions([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-3 border rounded shadow-sm"
          placeholder={currentTab === 'Profit' ? 'Search disabled in Profit tab' : 'Search items (works in Buy & Sell)'}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value === '') onSearch('');
          }}
          disabled={currentTab === 'Profit'}
        />
      </form>

      {suggestions.length > 0 && (
        <ul className="suggestion-list absolute left-0 right-0 mt-1 rounded max-h-56 overflow-auto p-1">
          {suggestions.map((s, idx) => (
            <li key={idx} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}