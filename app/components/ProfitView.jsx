'use client';
import React from 'react';
import ProfitCard from './ProfitCard';

/** Handles rendering of the Profit tab */
export default function ProfitView({ groupedProfit, profitItems }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Buy Low & Sell High</h2>
          <div className="text-sm text-gray-500">{profitItems.length} items</div>
        </div>

        <div className="mt-4 space-y-6">
          {Object.keys(groupedProfit).length === 0 ? (
            <div className="text-center text-gray-600">
              No items with profit at the moment.
            </div>
          ) : (
            Object.keys(groupedProfit).map(cat => (
              <section key={cat} className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-semibold">{cat}</h2>
                {Object.keys(groupedProfit[cat]).map(sub => (
                  <div key={sub} className="mt-3">
                    <h3 className="text-lg font-medium">{sub}</h3>
                    <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedProfit[cat][sub].map(p => (
                        <ProfitCard key={`${p.slug}-${p.sell.kingdomName}-${p.buy.kingdomName}`} item={p} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
