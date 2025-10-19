'use client';
import React, { useState } from 'react';

/**
 * ItemCard (v4.4.3b)
 * - Shows exact price text from API (no rounding)
 * - Total now limited to 4 decimals
 */
export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);

  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';
  const category = item.category || 'Misc';
  const subCategory = item.subCategory || 'General';
  const offer = item.singleOffer || {};

  // Use API string directly to avoid JS rounding
  const unitPriceStr = offer.unitPrice?.toString() ?? '0';
  const unitPriceNum = Number(offer.unitPrice ?? 0);
  const qty = Number(offer.quantity ?? 0);
  const kingdomUrl = offer.kingdomUrl || '#';
  const kingdomName = offer.kingdomName || 'kingdom';
  const total = (unitPriceNum * amount).toFixed(4); // clean 4 decimals

  const cardColor =
    viewType === 'buy' ? 'from-green-50 to-white' : 'from-yellow-50 to-white';

  return (
    <div className={`bg-gradient-to-r ${cardColor} rounded-lg p-4 shadow-sm card-hover`}>
      <div className="grid grid-cols-[64px_1fr] gap-3">
        <div className="flex items-center justify-center">
          <img
            src={img}
            alt={name}
            className="item-icon"
            style={{ width: 54, height: 54, objectFit: 'contain' }}
          />
        </div>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-sm text-gray-500">
              {category} / {subCategory}
            </div>
          </div>

          <div className="mt-2 text-sm space-y-1">
            {viewType === 'buy' ? (
              <div>
                <strong>Buy from:</strong>{' '}
                <a href={kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {kingdomName}
                </a>{' '}
                @ <span className="font-medium">{unitPriceStr}</span> gold
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            ) : (
              <div>
                <strong>Sell to:</strong>{' '}
                <a href={kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {kingdomName}
                </a>{' '}
                @ <span className="font-medium">{unitPriceStr}</span> gold
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm">Total</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(Math.max(1, Number(e.target.value || 1)))}
              className="w-20 p-2 border rounded"
            />
            <div className="text-sm ml-auto">
              <span className="font-semibold">{total}</span> gold
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}