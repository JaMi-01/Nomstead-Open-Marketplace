'use client';
import React, { useState } from 'react';
import CraftCard from './CraftCard';
import useCraftCalc from './hooks/useCraftCalc';

/**
 * CraftView
 * - Collapsed by default
 * - Search should be disabled by parent (same as Profit)
 * - Groups by category/subcategory like Buy/Sell/Profit
 */
export default function CraftView({ grouped, recipes }) {
  const { craftItems, groupedCraft } = useCraftCalc(grouped, recipes);

  // Local expand state (separate from main expand so we don't affect other tabs)
  const [expanded, setExpanded] = useState({});

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Craft &amp; Sell</h2>
          <div className="text-sm text-gray-500">{craftItems.length} items</div>
        </div>

        <div className="mt-4 space-y-6">
          {Object.keys(groupedCraft).length === 0 ? (
            <div className="text-center text-gray-600">
              No profitable craft routes at the moment.
            </div>
          ) : (
            Object.keys(groupedCraft).map((cat) => (
              <section key={cat} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-xl font-semibold flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                  >
                    <span className={`triangle ${expanded[cat] ? 'open' : ''}`}>▶</span> {cat}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {Object.keys(groupedCraft[cat]).length} subcategories
                  </div>
                </div>

                {expanded[cat] && (
                  <div className="mt-4 space-y-4">
                    {Object.keys(groupedCraft[cat]).map((sub) => (
                      <div key={sub}>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [`${cat}__${sub}`]: !prev[`${cat}__${sub}`],
                            }))
                          }
                        >
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <span className={`triangle ${expanded[`${cat}__${sub}`] ? 'open' : ''}`}>▶</span> {sub}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {groupedCraft[cat][sub].length} items
                          </div>
                        </div>

                        {expanded[`${cat}__${sub}`] && (
                          <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {groupedCraft[cat][sub].map((p) => (
                              <CraftCard key={`${p.slug}-${p.sell.kingdomName}`} item={p} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
