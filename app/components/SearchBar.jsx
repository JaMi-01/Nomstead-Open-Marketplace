'use client';
import React, { useEffect, useState, useRef } from 'react';

/**
 * SearchBar
 * - Dropdown visibility controlled by `open`
 * - Disabled in Profit and Craft
 */
export default function SearchBar({ onSearch = () => {}, currentTab = 'Buy', allGrouped = {} }) {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const disabled = currentTab === 'Profit' || currentTab === 'Craft';

  useEffect(() => {
    if (!open || !q || q.length < 1 || disabled) {
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
            names.push(it.name);
          }
        });
      });
    });
    const uniq = Array.from(new Set(names)).slice(0, 10);
    setSuggestions(uniq);
  }, [q, allGrouped, open, disabled]);

  const handleSelect = (s) => {
    setOpen(false);
    setSuggestions([]);
    setQ(s);
    onSearch(s);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    setSuggestions([]);
    onSearch(q);
    if (inputRef.current) inputRef.current.blur();
  };

  const clearSearch = () => {
    setQ('');
    setSuggestions([]);
    setOpen(false);
    onSearch('');
    if (inputRef.current) inputRef.current.blur();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full p-3 pr-8 border rounded shadow-sm"
            placeholder={
              disabled
                ? 'Search disabled in Profit & Craft'
                : 'Search items (works in Buy & Sell)'
            }
            value={q}
            onFocus={() => !disabled && setOpen(true)}
            onChange={(e) => {
              const value = e.target.value;
              setQ(value);
              if (disabled) return;
              if (value === '') {
                onSearch('');
                setSuggestions([]);
                setOpen(false);
              } else {
                setOpen(true);
              }
            }}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {q && !disabled && (
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

      {open && suggestions.length > 0 && !disabled && (
        <ul className="suggestion-list absolute left-0 right-0 mt-1 rounded max-h-56 overflow-auto p-1">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleSelect(s)}
              onTouchStart={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
