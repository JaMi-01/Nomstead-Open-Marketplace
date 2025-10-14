'use client';
import React, { useState } from 'react';

export default function ProfitCard({ item }) {
  // item: { slug, name, buy, sell, profitPerUnit }
  const [bulk, setBulk] = useState(1);
  const buy = item.buy;
  const sell = item.sell;
  const profitPerUnit = Number(item.profitPerUnit || 0);
  const totalProfit = profitPerUnit * Math.max(1, Number(bulk || 1));
  const name = prettify(item.buy.object?.slug || item.buy.object?.metadata || item.name);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-3">
        <img src={item.image || '/placeholder.png'} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>

          <div className="mt-2 text-sm space-y-2">
            <div>
              <strong>Buy from:</strong>{' '}
              <a href={buy.tile?.url || buy.tile?.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {buy.tile?.owner || buy.tile?.owner || 'kingdom'}
              </a>{' '}
              @ <span className="font-medium">{Number(buy.pricing?.unitPrice || 0).toFixed(4)} gold</span> Qty: {buy.pricing?.availableQuantity || 0}
            </div>

            <div>
              <strong>Sell to:</strong>{' '}
              <a href={sell.tile?.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {sell.tile?.owner || 'kingdom'}
              </a>{' '}
              @ <span className="font-medium">{Number(sell.pricing?.unitPrice || 0).toFixed(4)} gold</span> Qty: {sell.pricing?.desiredQuantity || 0}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Bulk:</label>
              <input
                type="number"
                min="1"
                value={bulk}
                onChange={(e) => setBulk(Math.max(1, Number(e.target.value || 1)))}
                className="w-24 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">Total profit: {totalProfit.toFixed(4)} gold</div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Profit per unit: <span className="font-medium">{profitPerUnit.toFixed(4)} gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function prettify(slug) {
  if (!slug) return '';
  return slug.replace(/[-]/g,'_').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}