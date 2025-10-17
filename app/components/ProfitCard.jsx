'use client';
import React, { useState, useEffect } from 'react';

export default function ProfitCard({ item }) {
  const buy = item.buy;
  const sell = item.sell;
  const profitPerUnit = Number(item.profitPerUnit || 0);

  const maxTradable = Math.min(Number(buy.quantity || 0), Number(sell.quantity || 0));
  const [bulk, setBulk] = useState(maxTradable > 0 ? maxTradable : 1);
  const [totalProfit, setTotalProfit] = useState(profitPerUnit * bulk);

  useEffect(() => {
    setTotalProfit(profitPerUnit * Math.max(1, Number(bulk || 1)));
  }, [bulk, profitPerUnit]);

  const name = item.name || item.slug || 'Item';
  const img = item.image || '/placeholder.png';

  // hvis profit = 0, skjul kort
  if (profitPerUnit <= 0.0001) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-3">
        <img src={img} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>

          <div className="mt-2 text-sm space-y-2">
            <div>
              <strong>Buy from:</strong>{' '}
              <a href={buy.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {buy.kingdomName || 'seller'}
              </a>{' '}
              @ <span className="font-medium">{parseFloat(buy.unitPrice).toPrecision(4)} gold</span>{' '}
              Qty: {buy.quantity}
            </div>

            <div>
              <strong>Sell to:</strong>{' '}
              <a href={sell.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {sell.kingdomName || 'buyer'}
              </a>{' '}
              @ <span className="font-medium">{parseFloat(sell.unitPrice).toPrecision(4)} gold</span>{' '}
              Qty: {sell.quantity}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Total:</label>
              <input
                type="number"
                min="1"
                max={maxTradable}
                value={bulk}
                onChange={e => setBulk(Math.max(1, Math.min(maxTradable, Number(e.target.value || 1))))}
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