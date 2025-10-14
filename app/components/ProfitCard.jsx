'use client';
import React, { useState } from 'react';

export default function ProfitCard({ item }) {
  const [bulk, setBulk] = useState(1);
  const buy = item.buy;
  const sell = item.sell;
  const profitPerUnit = Number(item.profitPerUnit || 0);
  const totalProfit = profitPerUnit * Math.max(1, Number(bulk || 1));
  const name = item.name || (buy?.slug || '');

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-3">
        <img src={item.image || '/placeholder.png'} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>

          <div className="mt-2 text-sm space-y-2">
            <div>
              <strong>Buy from:</strong>{' '}
              <a href={buy.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {buy.kingdomName || 'seller'}
              </a>{' '}
              @ <span className="font-medium">{Number(buy.unitPrice).toFixed(4)} gold</span> Qty: {buy.quantity}
            </div>

            <div>
              <strong>Sell to:</strong>{' '}
              <a href={sell.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {sell.kingdomName || 'buyer'}
              </a>{' '}
              @ <span className="font-medium">{Number(sell.unitPrice).toFixed(4)} gold</span> Qty: {sell.quantity}
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
