'use client';
import React, { useState } from 'react';
import Tabs from './Tabs';
import Loader from './Loader';
import ProfitView from './ProfitView';
import CategorySection from './CategorySection';
import Toolbar from './Toolbar';
import CraftView from './CraftView';
import useMarketplaceData from './hooks/useMarketplaceData';
import craftRecipes from '../data/craftRecipes.json';

/**
 * MarketplaceView
 * - Adds the Craft tab (search disabled there)
 */
export default function MarketplaceView() {
  const [activeTab, setActiveTab] = useState('Buy');
  const [query, setQuery] = useState('');

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

      <Tabs
        tabs={['Buy', 'Sell', 'Profit', 'Craft']}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {loading && <Loader />}

      {!loading && activeTab === 'Profit' && (
        <ProfitView groupedProfit={groupedProfit} profitItems={profitItems} />
      )}

      {!loading && activeTab === 'Craft' && (
        <CraftView grouped={grouped} recipes={craftRecipes} />
      )}

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

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="font-semibold text-red-700">Error</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}
