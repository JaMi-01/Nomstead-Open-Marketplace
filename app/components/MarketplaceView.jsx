'use client';
import React, { useState } from 'react';
import Tabs from './Tabs';
import Loader from './Loader';
import ProfitView from './ProfitView';
import CategorySection from './CategorySection';
import Toolbar from './Toolbar';
import useMarketplaceData from './hooks/useMarketplaceData';

/**
 * MarketplaceView (v4.4.2.1)
 * ---------------------------------------------
 * - Uses custom hook `useMarketplaceData()` for all data, grouping & profit logic.
 * - Renders toolbar (search + refresh controls).
 * - Displays tabs for Buy / Sell / Profit.
 * - Purely presentational – no data logic here.
 */

export default function MarketplaceView() {
  // Local UI state
  const [activeTab, setActiveTab] = useState('Buy');
  const [query, setQuery] = useState('');

  // Load all marketplace data & utils from custom hook
  const {
    loading,
    error,
    grouped,
    profitItems,
    groupedProfit,
    expanded,
    setExpanded,
    fetchData,
    expandAll,
    collapseAll,
    lastUpdated,
    minutesAgo
  } = useMarketplaceData(activeTab, query);

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* 🔍 Toolbar (search, refresh, expand/collapse) */}
      <Toolbar
        onSearch={setQuery}
        currentTab={activeTab}
        allGrouped={grouped}
        fetchData={fetchData}
        expandAll={expandAll}
        collapseAll={collapseAll}
        lastUpdated={lastUpdated}
        minutesAgo={minutesAgo}
      />

      {/* 🪙 Tabs */}
      <Tabs
        tabs={['Buy', 'Sell', 'Profit']}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ⏳ Loading indicator */}
      {loading && <Loader />}

      {/* 💰 Profit tab */}
      {!loading && activeTab === 'Profit' && (
        <ProfitView groupedProfit={groupedProfit} profitItems={profitItems} />
      )}

      {/* 🛒 Buy / Sell tabs */}
      {!loading && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map((cat) => (
            <CategorySection
              key={cat}
              cat={cat}
              grouped={grouped}
              query={query}
              expanded={expanded}
              setExpanded={setExpanded}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}

      {/* ⚠️ Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}
