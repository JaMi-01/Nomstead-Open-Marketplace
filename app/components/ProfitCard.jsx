'use client';
import React, { useState } from 'react';

function isRecipeFromString(s) {
  if (!s) return false;
  const w = s.toLowerCase();
  return w.includes('recipe') || w.includes('craft') || w.includes('recipe');
}

export default function ProfitCard({ item }) {
  const [bulk, setBulk] = useState(1);

  const buys = (item.buyOffers || []).slice();
  const sells = (item.sellOffers || []).slice();
  if (!buys.length || !sells.length) return null;

  // lowest buy and highest sell
  const lowestBuy = buys.reduce((a,b) => a.unitPrice <= b.unitPrice ? a : b);
  const highestSell = sells.reduce((a,b) => a.unitPrice >= b.unitPrice ? a : b);

  // Determine type from item.category/subCategory if possible
  const itemIsRecipe = isRecipeFromString(item.subCategory) || isRecipeFromString(item.category);

  // Attempt to ensure both sides are the same "type"
  const buyLooksRecipe = isRecipeFromString(item.subCategory) || isRecipeFromString(item.category);
  const sellLooksRecipe = isRecipeFromString(item.subCategory) || isRecipeFromString(item.category);

  // Since grouping by slug, we're already comparing identical slugs — safe to proceed
  const profitPerUnit = Number(highestSell.unitPrice) - Number(lowestBuy.unitPrice);
  if (profitPerUnit <= 0) return null;

  const total = profitPerUnit * Math.max(1, Number(bulk || 1));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex items-start gap-3">
        <img src={item.image || '/placeholder.png'} alt={item.name} className="item-icon rounded" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.name}</h3>

          <div className="mt-2 space-y-1 text-sm">
            <div>
              <strong>Buy from:</strong>{' '}
              <a href={lowestBuy.kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {lowestBuy.kingdomName || 'kingdom'}
              </a>{' '}
              @ <span className="font-medium">{Number(lowestBuy.unitPrice).toFixed(4)} gold</span> Qty: {lowestBuy.quantity}
            </div>

            <div>
              <strong>Sell to:</strong>{' '}
              <a href={highestSell.kingdomUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {highestSell.kingdomName || 'kingdom'}
              </a>{' '}
              @ <span className="font-medium">{Number(highestSell.unitPrice).toFixed(4)} gold</span> Qty: {highestSell.quantity}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Bulk:</label>
              <input
                type="number"
                min="1"
                value={bulk}
                onChange={(e) => setBulk(Math.max(1, Number(e.target.value || 1)))}
                className="w-24 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">Total profit: {Number(total).toFixed(4)} gold</div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Profit per unit: <span className="font-medium">{Number(profitPerUnit).toFixed(4)} gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
