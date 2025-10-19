'use client';
import React from 'react';
import ItemCard from './ItemCard';

/** Handles rendering of a single subcategory with its ItemCards */
export default function SubCategorySection({
  cat, sub, items, query, expanded, setExpanded, activeTab
}) {
  const filtered = items.filter(it => {
    if (!query) return true;
    const q = query.toLowerCase();
    return it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q);
  });
  if (!filtered.length) return null;

  const totalOffers = filtered.reduce((sum, it) => {
    const offers =
      activeTab === 'Buy'
        ? it.buyOffers?.length || 0
        : it.sellOffers?.length || 0;
    return sum + offers;
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3
          className="text-lg font-medium flex items-center gap-2 cursor-pointer"
          onClick={() =>
            setExpanded(prev => ({
              ...prev,
              [`${cat}__${sub}`]: !prev[`${cat}__${sub}`]
            }))
          }
        >
          <span className={`triangle ${expanded[`${cat}__${sub}`] ? 'open' : ''}`}>▶</span> {sub}
        </h3>
        <div className="text-sm text-gray-500">{totalOffers} items</div>
      </div>

      {expanded[`${cat}__${sub}`] && (
        <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(it => {
            const offers =
              activeTab === 'Buy'
                ? it.buyOffers.slice().sort((a,b)=>a.unitPrice - b.unitPrice)
                : it.sellOffers.slice().sort((a,b)=>b.unitPrice - a.unitPrice);
            return offers.map((offer, idx) => (
              <ItemCard
                key={`${it.slug}-${idx}`}
                item={{ ...it, singleOffer: offer }}
                viewType={activeTab.toLowerCase()}
              />
            ));
          })}
        </div>
      )}
    </div>
  );
}
