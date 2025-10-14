'use client';
import React, { useState } from 'react';

export default function ItemCard({ item, viewType = 'buy' }) {
  // Accept either grouped item (with buyOffers/sellOffers) or raw marketplace entry
  let isGrouped = Boolean(item.buyOffers || item.sellOffers);
  const [amount, setAmount] = useState(1);

  if (isGrouped) {
    const offers = viewType === 'buy' ? (item.buyOffers || []).slice().sort((a,b)=>a.unitPrice-b.unitPrice) : (item.sellOffers || []).slice().sort((a,b)=>b.unitPrice-a.unitPrice);
    if (!offers.length) return null;
    const best = offers[0];
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm card-hover">
        <div className="flex gap-3">
          <img src={item.image || '/placeholder.png'} alt={item.name} className="item-icon" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <div className="text-sm text-gray-500">{item.category}{item.subCategory ? ' / ' + item.subCategory : ''}</div>
              </div>
              <div className={`text-sm font-medium ${viewType === 'buy' ? 'text-nomBuy' : 'text-nomSell'}`}>{viewType === 'buy' ? 'Buy' : 'Sell'}</div>
            </div>

            <div className="mt-3">
              {offers.slice(0,5).map((o, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded p-2 bg-gray-50 mb-2">
                  <div>
                    <a href={o.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
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
              <label className="text-sm">Amount</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value || 1)))}
                className="w-24 p-2 border rounded"
              />
              <div className="text-sm">
                Total: <span className="font-semibold">{(Number(best.unitPrice) * amount).toFixed(4)}</span> gold
              </div>
              <a href={best.kingdomUrl || '#'} target="_blank" rel="noreferrer" className="ml-auto text-sm text-blue-600 underline">View Kingdom</a>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // raw entry
    const obj = item.object || {};
    const pricing = item.pricing || {};
    const tile = item.tile || {};
    const name = (obj.slug || obj.metadata || 'Item').replace(/[-]/g,'_').split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const unitPrice = Number(pricing.unitPrice || 0);
    const qty = viewType === 'buy' ? Number(pricing.availableQuantity || 0) : Number(pricing.desiredQuantity || 0);

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm card-hover">
        <div className="flex gap-3">
          <img src={obj.imageUrl || obj.thumbnailImageUrl || '/placeholder.png'} alt={name} className="item-icon" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <div className="text-sm text-gray-500">{obj.category}{obj.subCategory ? ' / ' + obj.subCategory : ''}</div>
              </div>
              <div className={`text-sm font-medium ${viewType === 'buy' ? 'text-nomBuy' : 'text-nomSell'}`}>{viewType === 'buy' ? 'Buy' : 'Sell'}</div>
            </div>

            <div className="mt-3 flex justify-between items-center border rounded p-2 bg-gray-50">
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

            <div className="mt-3 flex items-center gap-3">
              <label className="text-sm">Amount</label>
              <input
                type="number"
                min="1"
                defaultValue={1}
                onChange={() => {}}
                className="w-24 p-2 border rounded"
              />
              <div className="text-sm">
                Total: <span className="font-semibold">{unitPrice.toFixed(4)}</span> gold
              </div>
              <a href={tile.url || '#'} target="_blank" rel="noreferrer" className="ml-auto text-sm text-blue-600 underline">View Kingdom</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}