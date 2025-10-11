"use client";
import { useState } from "react";

export default function ItemCard({ item, mode = "BUY", prettify }) {
  // mode: "BUY" or "SELL"
  const [qty, setQty] = useState(1);
  const unit = Number(item?.pricing?.unitPrice ?? 0);
  const total = (unit * Number(qty || 0)).toFixed(2);
  const quantityAvailable = item?.quantityAvailable ?? (item?.pricing?.availableQuantity ?? item?.pricing?.desiredQuantity ?? 0);

  const headerColor = mode === "SELL" ? "#92400e" : "#047857";
  const cardClass = mode === "SELL" ? "card sell" : "card buy";

  return (
    <div className={cardClass}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ color: headerColor, marginBottom: 4 }}>{prettify(item.object?.slug)}</h3>
          <div className="meta">{item.object?.category ?? "—"} › {item.object?.subCategory ?? "—"}</div>
          <div className="small">Owner: <a href={item.tile?.url} target="_blank" rel="noreferrer" style={{ color: headerColor }}>{item.tile?.owner}</a></div>
        </div>
        <div className="right" style={{ minWidth: 110 }}>
          <div style={{ fontWeight: 800, color: headerColor }}>{unit} <span style={{ fontWeight: 400 }}>gold</span></div>
          <div className="small" style={{ marginTop: 6 }}>Qty: {quantityAvailable}</div>
          <div style={{ marginTop: 8, fontWeight: 700, color: headerColor }}>{mode === "SELL" ? "Sell" : "Buy"}</div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13 }}>Qty</label>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 80, padding: 8, borderRadius: 8, border: "1px solid #eee" }}
        />
        <div style={{ fontSize: 13 }}>{unit} × {qty} = <b>{total} gold</b></div>
      </div>
    </div>
  );
}
