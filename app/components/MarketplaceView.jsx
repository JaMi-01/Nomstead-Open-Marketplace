'use client';
import React, { useState } from 'react';
import Tabs from './Tabs';
import Loader from './Loader';
import ProfitView from './ProfitView';
import CategorySection from './CategorySection';
import Toolbar from './Toolbar';
import useMarketplaceData from './useMarketplaceData';

/** Main marketplace UI — now clean and modular */
export default function MarketplaceView() {
  const [activeTab, setActiveTab] = useState('Buy');
  const [query, setQuery] = useState('');

  // Load all data and utilities from custom hook
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

      <Tabs tabs={['Buy','Sell','Profit']} activeTab={activeTab} setActiveTab={setActiveTab} />
      {loading && <Loader />}

      {!loading && activeTab === 'Profit' && (
        <ProfitView groupedProfit={groupedProfit} profitItems={profitItems} />
      )}

      {!loading && (activeTab === 'Buy' || activeTab === 'Sell') && (
        <div className="space-y-6">
          {Object.keys(grouped).map(cat => (
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

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}
