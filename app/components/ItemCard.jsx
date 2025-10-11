'use client';
import React, { useState } from 'react';

/*
  item structure expected:
  {
    slug,
    name,
    image,
    category,
    subCategory,
    buyOffers: [{unitPrice, quantity, kingdomName, kingdomUrl}],
    sellOffers: [{unitPrice, quantity, kingdomName, kingdomUrl}]
  }
  When rendering a buy-card, show buyOffers sorted ascending; sell-card show sellOffers sorted descending.
*/

export default function ItemCard({ item, viewType = 'buy' }) {
  const [qty, setQty] = useState(1);

  const offers = viewType === 'buy'
    ? (item.buyOffers || []).slice().sort((a,b) => a.unitPrice - b.unitPrice)
    : (item.sellOffers || []).slice().sort((a,b) => b.unitPrice - a.unitPrice);

  if (!offers.length) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-4">
        <img src={item.image || '/placeholder.png'} alt={item.name} className="w-28 h-20 object-cover rounded"/>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <div className="text-sm text-gray-500">{item.category}{item.subCategory ? ' / ' + item.subCategory : ''}</div>
          </div>

          <div className="mt-2 space-y-2">
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

          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              className="w-24 p-2 border rounded"
            />
            <div className="text-sm">
              Total (example): <span className="font-semibold">
                {Number(offers[0].unitPrice * qty).toFixed(4)} gold
              </span>
            </div>
            <a href={offers[0].kingdomUrl} target="_blank" rel="noreferrer" className="ml-auto text-sm text-blue-600 underline">View Kingdom</a>
          </div>
        </div>
      </div>
    </div>
  );
}