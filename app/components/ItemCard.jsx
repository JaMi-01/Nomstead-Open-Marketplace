'use client';
import React, { useState, useMemo } from 'react';

/**
 * ItemCard v4.3.4
 * - Corrects 0 gold bug in Buy/Sell tabs
 * - Shows proper lowest (buy) / highest (sell) price
 * - Keeps consistent layout and total calculation
 */

export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);

  // pick correct offers depending on tab
  const offers = useMemo(() => {
    if (!item) return [];
    const list =
      viewType === 'buy'
        ? item.buyOffers || []
        : item.sellOffers || [];
    if (!list.length) return [];
    // sort: lowest first for buy, highest first for sell
    return list.slice().sort((a, b) =>
      viewType === 'buy'
        ? a.unitPrice - b.unitPrice
        : b.unitPrice - a.unitPrice
    );
  }, [item, viewType]);

  // no valid offers
  if (!offers.length) return null;

  const best = offers[0];
  const unitPrice = Number(best.unitPrice ?? 0);
  const qty = Number(best.quantity ?? 0);
  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';

  const total = (unitPrice * amount).toFixed(4);

  // choose card color based on tab
  const cardColor =
    viewType === 'buy'
      ? 'from-green-50 to-white'
      : 'from-yellow-50 to-white';

  return (
    <div className={`bg-gradient-to-r ${cardColor} rounded-lg p-4 shadow-sm card-hover`}>
      <div className="grid grid-cols-[64px_1fr] gap-3">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <img
            src={img}
            alt={name}
            className="item-icon"
            style={{ width: 54, height: 54, objectFit: 'contain' }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-sm text-gray-500">
              {item.category}
              {item.subCategory ? ' / ' + item.subCategory : ''}
            </div>
          </div>

          <div className="mt-2 text-sm space-y-1">
            {viewType === 'buy' ? (
              <div>
                <strong>Buy from:</strong>{' '}
                <a
                  href={best.kingdomUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {best.kingdomName || 'seller'}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            ) : (
              <div>
                <strong>Sell to:</strong>{' '}
                <a
                  href={best.kingdomUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {best.kingdomName || 'buyer'}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)}</span> gold
                <div className="text-xs text-gray-600">Qty: {qty}</div>
              </div>
            )}
          </div>

          {/* Total line */}
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

          {/* Optional: list all offers */}
          {offers.length > 1 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-600">
                Show all offers ({offers.length})
              </summary>
              <div className="mt-2 space-y-2">
                {offers.map((o, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-start border rounded p-2 bg-gray-50"
                  >
                    <div>
                      <a
                        href={o.kingdomUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {o.kingdomName || 'kingdom'}
                      </a>
                      <div className="text-xs text-gray-600">
                        Unit: {Number(o.unitPrice).toFixed(4)} gold
                      </div>
                    </div>
                    <div className="text-right text-xs">Qty: {o.quantity}</div>
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