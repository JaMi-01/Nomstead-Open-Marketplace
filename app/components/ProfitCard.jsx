'use client';
import React, { useState } from 'react';

export default function ProfitCard({ item }) {
  const [total, setTotal] = useState(1);
  const buy = item.buy;
  const sell = item.sell;
  const profitPerUnit = Number(item.profitPerUnit || 0);
  const totalProfit = profitPerUnit * Math.max(1, Number(total || 1));
  const name = item.name || item.slug || 'Item';

  return (
    <div className="bg-gradient-to-r from-sky-50 to-white rounded-lg p-4 shadow-sm card-hover border border-sky-200">
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0 flex items-center justify-center w-[58px] h-[58px] rounded-md bg-white">
          <img src={item.image || '/placeholder.png'} alt={name} className="item-icon" />
        </div>
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
              <label className="text-sm">Total:</label>
              <input
                type="number"
                min="1"
                value={total}
                onChange={(e) => setTotal(Math.max(1, Number(e.target.value || 1)))}
                className="w-24 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">
                Total profit: {totalProfit.toFixed(4)} gold
              </div>
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