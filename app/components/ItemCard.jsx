'use client';
import React, { useState } from 'react';

/**
 * For hver offer (buy eller sell) laver vi ét kort.
 * page.jsx håndterer at sende individuelle offers ind som item.
 */
export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);

  const unitPrice = Number(item.unitPrice || 0);
  const qty = Number(item.quantity || 0);
  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';
  const category = item.category || 'Misc';
  const sub = item.subCategory || 'General';
  const url = item.kingdomUrl || '#';
  const owner = item.kingdomName || 'kingdom';

  // farver
  const colorClass =
    viewType === 'buy'
      ? 'from-green-50 to-white border-green-200'
      : 'from-amber-50 to-white border-amber-200';

  return (
    <div className={`bg-gradient-to-r ${colorClass} border rounded-lg p-4 shadow-sm card-hover`}>
      <div className="flex gap-3">
        <img src={img} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="text-sm text-gray-500">{category} / {sub}</div>

          <div className="mt-3 text-sm space-y-2">
            {viewType === 'buy' && (
              <div>
                <strong>Buy from:</strong>{' '}
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {owner}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold — Qty: {qty}
              </div>
            )}

            {viewType === 'sell' && (
              <div>
                <strong>Sell to:</strong>{' '}
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {owner}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold — Qty: {qty}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Total:</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value || 1)))}
                className="w-20 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">
                {(unitPrice * amount).toFixed(4)} gold
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}