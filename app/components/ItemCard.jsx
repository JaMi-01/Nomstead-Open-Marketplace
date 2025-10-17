'use client';
import React, { useState, useMemo } from 'react';

export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);

  // Detect if this is raw API entry or grouped item
  const isRaw = item?.object && item?.pricing;
  const obj = isRaw ? item.object : item;
  const img = obj.imageUrl || obj.thumbnailImageUrl || obj.image || '/placeholder.png';
  const name = obj.name || obj.slug || 'Item';
  const category = obj.category || 'Misc';
  const subCategory = obj.subCategory || 'General';

  // extract offer data
  let unitPrice = 0;
  let qty = 0;
  let kingdomUrl = '#';
  let kingdomName = '';

  if (isRaw) {
    unitPrice = Number(item.pricing?.unitPrice ?? 0);
    qty =
      viewType === 'buy'
        ? Number(item.pricing?.availableQuantity ?? 0)
        : Number(item.pricing?.desiredQuantity ?? 0);
    kingdomUrl = item.tile?.url || '#';
    kingdomName = item.tile?.owner || 'kingdom';
  } else {
    const offers =
      viewType === 'buy' ? item.buyOffers || [] : item.sellOffers || [];
    if (offers.length) {
      const sorted =
        viewType === 'buy'
          ? offers.slice().sort((a, b) => a.unitPrice - b.unitPrice)
          : offers.slice().sort((a, b) => b.unitPrice - a.unitPrice);
      const best = sorted[0];
      unitPrice = Number(best.unitPrice ?? 0);
      qty = Number(best.quantity ?? 0);
      kingdomUrl = best.kingdomUrl || '#';
      kingdomName = best.kingdomName || 'kingdom';
    }
  }

  const total = (unitPrice * amount).toFixed(4);
  const cardColor =
    viewType === 'buy'
      ? 'from-green-50 to-white'
      : 'from-yellow-50 to-white';

  return (
    <div
      className={`bg-gradient-to-r ${cardColor} rounded-lg p-4 shadow-sm card-hover`}
    >
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
              {category}
              {subCategory ? ' / ' + subCategory : ''}
            </div>
          </div>

          <div className="mt-2 text-sm space-y-1">
            {viewType === 'buy' ? (
              <div>
                <strong>Buy from:</strong>{' '}
                <a
                  href={kingdomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {kingdomName}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            ) : (
              <div>
                <strong>Sell to:</strong>{' '}
                <a
                  href={kingdomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {kingdomName}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold
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
              onChange={(e) =>
                setAmount(Math.max(1, Number(e.target.value || 1)))
              }
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