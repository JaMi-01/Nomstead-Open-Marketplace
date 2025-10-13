'use client';
import React, { useState } from 'react';

export default function ProfitCard({ item }) {
  const [bulk, setBulk] = useState(1);

  const lowestBuy = (item.buyOffers || []).slice().sort((a,b) => Number(a.unitPrice) - Number(b.unitPrice))[0];
  const highestSell = (item.sellOffers || []).slice().sort((a,b) => Number(b.unitPrice) - Number(a.unitPrice))[0];

  if (!lowestBuy || !highestSell) return null;

  const profitPerUnit = Number(highestSell.unitPrice) - Number(lowestBuy.unitPrice);
  if (profitPerUnit <= 0) return null;

  const total = profitPerUnit * Math.max(1, Number(bulk || 1));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <h3 className="text-lg font-semibold">{item.name}</h3>

      <div className="mt-2 space-y-1">
        <div className="text-sm">
          <strong>Buy from:</strong>{' '}
          <a href={lowestBuy.kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {lowestBuy.kingdomName || 'kingdom'}
          </a>{' '}
          @ <span className="font-medium">{Number(lowestBuy.unitPrice).toFixed(4)} gold</span> Qty: {lowestBuy.quantity}
        </div>

        <div className="text-sm">
          <strong>Sell to:</strong>{' '}
          <a href={highestSell.kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {highestSell.kingdomName || 'kingdom'}
          </a>{' '}
          @ <span className="font-medium">{Number(highestSell.unitPrice).toFixed(4)} gold</span> Qty: {highestSell.quantity}
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
          <div className="ml-auto text-sm font-semibold">Total profit: {Number(total).toFixed(4)} gold</div>
        </div>

        <div className="mt-2 text-xs text-gray-600">
          Profit per unit: <span className="font-medium">{Number(profitPerUnit).toFixed(4)} gold</span>
        </div>
      </div>
    </div>
  );
}
