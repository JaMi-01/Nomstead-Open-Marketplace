'use client';
import React, { useState, useEffect } from 'react';

/**
 * ProfitCard (v4.4.3f)
 * - Uses exact API strings for buy/sell prices (no rounding)
 * - Uses profitPerUnitStr and profitDecimals from hook for consistent display
 * - Filters for zero profit is handled in hook; here we just render
 */
export default function ProfitCard({ item }) {
  const buy = item.buy;
  const sell = item.sell;

  // Exact strings from API preserved upstream
  const buyPriceStr = buy.unitPrice ?? '0';
  const sellPriceStr = sell.unitPrice ?? '0';

  // Profit from hook (both numeric + string + decimals)
  const profitPerUnitNum = Number(item.profitPerUnit ?? 0);
  const profitPerUnitStr = item.profitPerUnitStr ?? '0';
  const profitDecimals = Number.isInteger(item.profitDecimals)
    ? item.profitDecimals
    : (sellPriceStr.includes('.') ? sellPriceStr.split('.')[1].length : 0);

  const maxTradable = Math.min(Number(buy.quantity || 0), Number(sell.quantity || 0));

  const [bulk, setBulk] = useState(maxTradable > 0 ? maxTradable : 1);
  const [totalProfit, setTotalProfit] = useState(profitPerUnitNum * bulk);

  useEffect(() => {
    setTotalProfit(profitPerUnitNum * Math.max(1, Number(bulk || 1)));
  }, [bulk, profitPerUnitNum]);

  const name = item.name || item.slug || 'Item';
  const img = item.image || '/placeholder.png';

  const formattedTotalProfit = totalProfit.toFixed(profitDecimals);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-3">
        <img src={img} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>

          <div className="mt-2 text-sm space-y-2">
            <div>
              <strong>Buy from:</strong>{' '}
              <a
                href={buy.kingdomUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {buy.kingdomName || 'seller'}
              </a>{' '}
              @ <span className="font-medium">{buyPriceStr}</span> gold Qty: {buy.quantity}
            </div>

            <div>
              <strong>Sell to:</strong>{' '}
              <a
                href={sell.kingdomUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {sell.kingdomName || 'buyer'}
              </a>{' '}
              @ <span className="font-medium">{sellPriceStr}</span> gold Qty: {sell.quantity}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Total:</label>
              <input
                type="number"
                min="1"
                max={maxTradable}
                value={bulk}
                onChange={(e) =>
                  setBulk(Math.max(1, Math.min(maxTradable, Number(e.target.value || 1))))
                }
                className="w-24 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">
                Total profit: {formattedTotalProfit} gold
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Profit per unit:{' '}
              <span className="font-medium">{profitPerUnitStr} gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}