'use client';
import React, { useEffect, useState } from 'react';

/**
 * CraftCard
 * - Shows materials (cheapest buy each), craft step, and best sell target
 * - Profit per unit and total follow sell price decimals
 * - Total slider is capped by maxTradable from hook
 */
export default function CraftCard({ item }) {
  const img = item.image || '/placeholder.png';
  const name = item.name || item.slug || 'Item';

  const sellPriceStr = item.sell.unitPrice ?? '0';
  const sellDecimals = item.profitDecimals ?? (
    sellPriceStr.includes('.') ? sellPriceStr.split('.')[1].length : 0
  );

  const [bulk, setBulk] = useState(item.maxTradable > 0 ? item.maxTradable : 1);
  const [totalProfit, setTotalProfit] = useState(item.profitPerUnit * bulk);

  useEffect(() => {
    setTotalProfit(item.profitPerUnit * Math.max(1, Number(bulk || 1)));
  }, [bulk, item.profitPerUnit]);

  const formattedTotal = totalProfit.toFixed(sellDecimals);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm card-hover">
      <div className="flex gap-3">
        <img src={img} alt={name} className="item-icon" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>

          <div className="mt-2 text-sm space-y-2">
            {/* Materials list */}
            {item.materials.map((m) => {
              const priceStr = m.offer.unitPrice ?? '0';
              return (
                <div key={m.slug}>
                  <strong>Buy {m.qtyPerCraft}</strong> {m.name} from{' '}
                  <a
                    href={m.offer.kingdomUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {m.offer.kingdomName || 'seller'}
                  </a>{' '}
                  @ <span className="font-medium">{priceStr}</span> gold
                </div>
              );
            })}

            {/* Craft step */}
            <div className="text-gray-700">
              <strong>Craft</strong> {name} (x{item.outputPerCraft} per batch)
            </div>

            {/* Sell step */}
            <div>
              <strong>Sell to:</strong>{' '}
              <a
                href={item.sell.kingdomUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {item.sell.kingdomName || 'buyer'}
              </a>{' '}
              @ <span className="font-medium">{sellPriceStr}</span> gold Qty: {item.sell.quantity}
            </div>

            {/* Total controls */}
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Total:</label>
              <input
                type="number"
                min={1}
                max={item.maxTradable}
                value={bulk}
                onChange={(e) =>
                  setBulk(Math.max(1, Math.min(item.maxTradable, Number(e.target.value || 1))))
                }
                className="w-24 p-2 border rounded"
              />
              <div className="ml-auto text-sm font-semibold">
                Total profit: {formattedTotal} gold
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              Profit per unit:{' '}
              <span className="font-medium">{item.profitPerUnitStr} gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
