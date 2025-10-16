'use client';
import React, { useState } from 'react';

export default function ItemCard({ item, viewType = 'buy' }) {
  const [amount, setAmount] = useState(1);
  const isGrouped = Boolean(item?.buyOffers || item?.sellOffers);

  // Hent og sorter relevante tilbud
  let offers = [];
  if (isGrouped) {
    offers = viewType === 'buy'
      ? (item.buyOffers || []).slice().sort((a,b)=>a.unitPrice - b.unitPrice)
      : (item.sellOffers || []).slice().sort((a,b)=>b.unitPrice - a.unitPrice);
  }
  if (isGrouped && offers.length === 0) return null;

  const best = isGrouped ? offers[0] : null;
  const unitPrice = isGrouped ? Number(best.unitPrice || 0) : Number(item.pricing?.unitPrice || 0);
  const qty = isGrouped ? Number(best.quantity || 0) : Number(item.pricing?.availableQuantity || item.pricing?.desiredQuantity || 0);
  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';

  // Farver og baggrund afhængig af viewType
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
          <div className="text-sm text-gray-500">
            {item.category}{item.subCategory ? ' / ' + item.subCategory : ''}
          </div>

          <div className="mt-3 text-sm space-y-2">
            {viewType === 'buy' && (
              <div>
                <strong>Buy from:</strong>{' '}
                <a href={best.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {best.kingdomName || 'seller'}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)} gold</span> Qty: {qty}
              </div>
            )}

            {viewType === 'sell' && (
              <div>
                <strong>Sell to:</strong>{' '}
                <a href={best.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {best.kingdomName || 'buyer'}
                </a>{' '}
                @ <span className="font-medium">{unitPrice.toFixed(4)} gold</span> Qty: {qty}
              </div>
            )}

            {/* Totalberegning */}
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