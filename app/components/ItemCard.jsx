'use client';
import React, { useState } from 'react';

/**
 * ItemCard expects grouped item shape:
 * {
 *   slug, name, category, subCategory, image,
 *   buyOffers: [{ unitPrice, quantity, kingdomUrl, kingdomName }, ...],
 *   sellOffers: [...]
 * }
 *
 * viewType === 'buy' -> show buyOffers sorted asc (lowest first)
 * viewType === 'sell' -> show sellOffers sorted desc (highest first)
 */
export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);
  const isGrouped = Boolean(item?.buyOffers || item?.sellOffers);

  // pick offers based on viewType and sort
  let offers = [];
  if (isGrouped) {
    offers = viewType === 'buy'
      ? (item.buyOffers || []).slice().sort((a,b)=>a.unitPrice - b.unitPrice)
      : (item.sellOffers || []).slice().sort((a,b)=>b.unitPrice - a.unitPrice);
  }

  // if no offers -> render nothing
  if (isGrouped && offers.length === 0) return null;

  const best = isGrouped ? offers[0] : null;
  const unitPrice = isGrouped ? Number(best.unitPrice || 0) : Number(item.pricing?.unitPrice || 0);
  const qty = isGrouped ? Number(best.quantity || 0) : Number(item.pricing?.availableQuantity || item.pricing?.desiredQuantity || 0);
  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm card-hover">
      <div className="grid grid-cols-[64px_1fr] gap-3">
        {/* LEFT: icon area (fills approx two lines visually) */}
        <div className="flex items-center justify-center">
          <img src={img} alt={name} className="item-icon" />
        </div>

        {/* RIGHT: info */}
        <div className="flex flex-col h-full">
          <div>
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-sm text-gray-500">{item.category}{item.subCategory ? ' / ' + item.subCategory : ''}</div>
          </div>

          <div className="mt-3 text-sm space-y-1">
            {viewType === 'buy' ? (
              <div>
                <div>
                  <strong>Buy from:</strong>{' '}
                  <a href={best.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {best.kingdomName || 'kingdom'}
                  </a>{' '}
                  @ <span className="font-medium">{Number(unitPrice).toFixed(4)}</span> gold
                </div>
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            ) : (
              <div>
                <div>
                  <strong>Sell to:</strong>{' '}
                  <a href={best.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {best.kingdomName || 'kingdom'}
                  </a>{' '}
                  @ <span className="font-medium">{Number(unitPrice).toFixed(4)}</span> gold
                </div>
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            )}
          </div>

          {/* Bulk line */}
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm">Amount</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value || 1)))}
              className="w-20 p-2 border rounded"
            />
            <div className="text-sm ml-auto">
              Total: <span className="font-semibold">{(unitPrice * amount).toFixed(4)}</span> gold
            </div>
          </div>

          {/* If you want to list all offers (no top-5 limit), we can optionally render them:
              below we show a collapsible list of all offers for transparency */}
          {isGrouped && offers.length > 1 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-600">Show all offers ({offers.length})</summary>
              <div className="mt-2 space-y-2">
                {offers.map((o, i) => (
                  <div key={i} className="flex justify-between items-start border rounded p-2 bg-gray-50">
                    <div>
                      <a href={o.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {o.kingdomName || 'kingdom'}
                      </a>
                      <div className="text-xs text-gray-600">Unit: {Number(o.unitPrice).toFixed(4)} gold</div>
                    </div>
                    <div className="text-right text-xs">
                      Qty: {o.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
