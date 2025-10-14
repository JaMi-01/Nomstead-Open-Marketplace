'use client';
import React, { useState } from 'react';

export default function ItemCard({ item, viewType = 'buy' }) {
  // `item` here is an entry from toBuy or toSell (API raw entry)
  // normalize fields
  const obj = item.object || {};
  const pricing = item.pricing || {};
  const tile = item.tile || {};
  const image = obj.imageUrl || obj.thumbnailImageUrl || '';
  const name = prettify(obj.slug || obj.metadata || obj.slug || 'Item');

  const unitPrice = Number(pricing.unitPrice || 0);
  const qty = viewType === 'buy' ? Number(pricing.availableQuantity || 0) : Number(pricing.desiredQuantity || 0);
  const [amount, setAmount] = useState(1);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm card-hover`}>
      <div className="flex gap-3">
        <img src={image || '/placeholder.png'} alt={name} className="item-icon" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <div className="text-sm text-gray-500">{obj.category || ''}{obj.subCategory ? ' / ' + obj.subCategory : ''}</div>
            </div>
            <div className={`text-sm font-medium ${viewType==='buy' ? 'text-nomBuy' : 'text-nomSell'}`}>{viewType === 'buy' ? 'Buy' : 'Sell'}</div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between items-center border rounded p-2 bg-gray-50">
              <div>
                <a href={tile.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {tile.owner || 'kingdom'}
                </a>
                <div className="text-sm text-gray-600">
                  Unit Price: <span className="font-medium">{unitPrice.toFixed(4)}</span> gold
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Qty: {qty}</div>
              </div>
            </div>
          </div>

          {/* bulk calculator as last line */}
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm">Amount</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value || 1)))}
              className="w-24 p-2 border rounded"
            />
            <div className="text-sm">
              Total: <span className="font-semibold">{(unitPrice * amount).toFixed(4)}</span> gold
            </div>
            <a href={tile.url || '#'} target="_blank" rel="noreferrer" className="ml-auto text-sm text-blue-600 underline">View Kingdom</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function prettify(slug) {
  if (!slug) return '';
  const parts = slug.replace(/[-]/g,'_').split('_').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));
  const idx = parts.findIndex(p => p.toLowerCase() === 'wood');
  if (idx > 0) {
    const wood = parts.splice(idx,1)[0];
    parts.unshift(wood);
  }
  return parts.join(' ');
}