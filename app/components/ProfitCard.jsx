"use client";
import { useState } from "react";

/*
  item = {
    name, buySeller, buyLink, sellBuyer, sellLink, buyPrice, sellPrice, buyQty, sellQty
  }
*/
export default function ProfitCard({ item }) {
  const [bulk, setBulk] = useState(1);
  const profitEach = Number(item.sellPrice) - Number(item.buyPrice);
  const available = Math.min(Number(item.buyQty || 0), Number(item.sellQty || 0));
  const totalProfit = (profitEach * Number(bulk || 0)).toFixed(2);

  return (
    <div className="card profit">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0, color: "#075985" }}>{item.name}</h3>
          <div className="meta">Available (min buy/sell): {available}</div>
        </div>
        <div className="right">
          <div style={{ fontWeight: 800, color: "#075985" }}>{profitEach.toFixed(2)} <span style={{ fontWeight: 400 }}>gold</span></div>
          <div className="small">Profit / unit</div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div className="small">Buy from: <a href={item.buyLink} target="_blank" rel="noreferrer">{item.buySeller}</a> @ {item.buyPrice} gold</div>
        <div className="small" style={{ marginTop: 4 }}>Sell to: <a href={item.sellLink} target="_blank" rel="noreferrer">{item.sellBuyer}</a> @ {item.sellPrice} gold</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label className="small">Bulk</label>
        <input type="number" min="1" value={bulk} onChange={(e) => setBulk(Number(e.target.value))} />
        <div style={{ marginTop: 8, fontWeight: 700 }}>Total profit: {totalProfit} gold</div>
      </div>
    </div>
  );
}
