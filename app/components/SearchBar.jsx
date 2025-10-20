'use client';
import React, { useEffect, useState, useRef } from 'react';

/**
 * SearchBar
 * - Dropdown closes immediately on selection (also on mobile)
 * - Adds a clear (✕) button inside input field
 */
export default function SearchBar({ onSearch = () => {}, currentTab = 'Buy', allGrouped = {} }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

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
          if (
            it.name.toLowerCase().includes(ql) ||
            it.slug.toLowerCase().includes(ql)
          ) {
            names.push(it.name);
          }
        });
      });
    });

    const uniq = Array.from(new Set(names)).slice(0, 10);
    setSuggestions(uniq);
  }, [q, allGrouped]);

  const handleSelect = (s) => {
    // Close dropdown immediately (also fixes mobile Safari delay)
    requestAnimationFrame(() => setSuggestions([]));
    setQ(s);
    onSearch(s);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    onSearch(q);
  };

  const clearSearch = () => {
    setQ('');
    setSuggestions([]);
    onSearch('');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            className="w-full p-3 pr-8 border rounded shadow-sm"
            placeholder={
              currentTab === 'Profit'
                ? 'Search disabled in Profit tab'
                : 'Search items (works in Buy & Sell)'
            }
            value={q}
            onChange={(e) => {
              const value = e.target.value;
              setQ(value);
              if (value === '') {
                onSearch('');
                setSuggestions([]);
              }
            }}
            disabled={currentTab === 'Profit'}
          />

          {/* Clear button */}
          {q && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {suggestions.length > 0 && (
        <ul className="suggestion-list absolute left-0 right-0 mt-1 rounded max-h-56 overflow-auto p-1">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}