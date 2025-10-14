'use client';
import React, { useState } from 'react';

export default function ItemCard({ item, viewType = 'buy' }) {
  const [qty, setQty] = useState(1);

  const offers = viewType === 'buy'
    ? (item.buyOffers || []).slice().sort((a,b) => Number(a.unitPrice) - Number(b.unitPrice))
    : (item.sellOffers || []).slice().sort((a,b) => Number(b.unitPrice) - Number(a.unitPrice));

  if (!offers.length) return null;

  const best = offers[0] || { unitPrice: 0, quantity: 0, kingdomName: 'kingdom', kingdomUrl: '#' };
  const img = item.image || '/placeholder.png';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img src={img} alt={item.name} className="item-icon rounded" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <div className="text-sm text-gray-500">{item.category}{item.subCategory ? ' / ' + item.subCategory : ''}</div>
            </div>
            <div className="text-sm text-gray-600">{viewType === 'buy' ? 'Buy' : 'Sell'}</div>
          </div>

          <div className="mt-3 space-y-2">
            {offers.slice(0,5).map((o, idx) => (
              <div key={idx} className="flex justify-between items-center border rounded p-2 bg-gray-50">
                <div>
                  <a href={o.kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {o.kingdomName || 'kingdom'}
                  </a>
                  <div className="text-sm text-gray-600">
                    Unit Price: <span className="font-medium">{Number(o.unitPrice).toFixed(4)}</span> gold
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Qty: {o.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          {/* bulk calculator as last line */}
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm">Amount</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              className="w-24 p-2 border rounded"
            />
            <div className="text-sm">
              Total: <span className="font-semibold">{Number(best.unitPrice * qty).toFixed(4)}</span> gold
            </div>
            <a href={best.kingdomUrl} target="_blank" rel="noreferrer" className="ml-auto text-sm text-blue-600 underline">View Kingdom</a>
          </div>
        </div>
      </div>
    </div>
  );
}
