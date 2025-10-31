'use client';
import React from 'react';
import SubCategorySection from './SubCategorySection';

/** Renders one category block (Buy/Sell) */
export default function CategorySection({
  cat, grouped, query, expanded, setExpanded, activeTab
}) {
  const visibleSubs = Object.keys(grouped[cat]).filter(sub => {
    const filteredItems = grouped[cat][sub].filter(it => {
      if (!query) return true;
      const q = query.toLowerCase();
      return it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q);
    });
    return filteredItems.length > 0;
  });
  if (visibleSubs.length === 0) return null;

  return (
    <section className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2
          className="text-xl font-semibold flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))}
        >
          <span className={`triangle ${expanded[cat] ? 'open' : ''}`}>▶</span> {cat}
        </h2>
        <div className="text-sm text-gray-500">{visibleSubs.length} subcategories</div>
      </div>

      {expanded[cat] && (
        <div className="mt-4 space-y-4">
          {visibleSubs.map(sub => (
            <SubCategorySection
              key={sub}
              cat={cat}
              sub={sub}
              items={grouped[cat][sub]}
              query={query}
              expanded={expanded}
              setExpanded={setExpanded}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}
    </section>
  );
}
