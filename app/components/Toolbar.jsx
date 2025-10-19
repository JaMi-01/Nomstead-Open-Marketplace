'use client';
import React from 'react';
import SearchBar from './SearchBar';

/** Toolbar = Search + Refresh / Expand / Collapse controls */
export default function Toolbar({
  onSearch,
  currentTab,
  allGrouped,
  fetchData,
  expandAll,
  collapseAll,
  lastUpdated,
  minutesAgo
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <SearchBar onSearch={onSearch} currentTab={currentTab} allGrouped={allGrouped} />
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-3 items-center">
          <button onClick={fetchData} className="px-3 py-2 bg-white border rounded">Refresh</button>
          <button onClick={expandAll} className="px-3 py-2 bg-green-100 rounded">Expand All</button>
          <button onClick={collapseAll} className="px-3 py-2 bg-yellow-100 rounded">Collapse All</button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated {minutesAgo ?? 0} min ago
          </p>
        )}
      </div>
    </div>
  );
}
