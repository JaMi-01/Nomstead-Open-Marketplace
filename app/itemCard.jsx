"use client";
import { useState } from "react";

export default function ItemCard({ item, prettify, profit }) {
  const [qty, setQty] = useState(1);
  const unitPrice = Number(item?.pricing?.unitPrice ?? 0);
  const total = (unitPrice * Number(qty || 0)).toFixed(2);
  const isSell = (item?.__type ?? "").toUpperCase() === "SELL";
  const quantityAvailable = item?.quantityAvailable ?? 0;

  const borderColor = isSell ? "#fcd34d" : "#34d399";
  const headerColor = isSell ? "#92400e" : "#047857";

  return (
    <div style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      background: "#fff",
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      minWidth: 220,
      boxShadow: "0 6px 18px rgba(13,18,25,0.06)"
    }}>
      <img
        src={item?.object?.thumbnailImageUrl || item?.object?.imageUrl || "/favicon.ico"}
        alt={item?.object?.slug}
        style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flex: "0 0 56px" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, color: headerColor }}>{prettify(item?.object?.slug)}</div>
            <div style={{ fontSize: 12, color: "#555" }}>{item?.object?.category ?? "—"} › {item?.object?.subCategory ?? "—"}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Owner: <a href={item?.tile?.url || "#"} target="_blank" rel="noreferrer" style={{ color: headerColor }}>{item?.tile?.owner ?? "player"}</a>
            </div>
          </div>

          <div style={{ textAlign: "right", minWidth: 92 }}>
            <div style={{ fontWeight: 800, color: headerColor }}>{unitPrice} <span style={{ fontWeight: 400 }}>gold</span></div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Quantity: {quantityAvailable}</div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: headerColor }}>{isSell ? "Sell" : "Buy"}</div>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 13 }}>Qty</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{ width: 84, padding: 8, borderRadius: 8, border: "1px solid #eee" }}
          />
          <div style={{ fontSize: 13 }}>{unitPrice} × {qty} = <b>{total} gold</b></div>

          {isSell && profit !== null && (
            <div style={{ marginLeft: "auto", background: "#fff7ed", border: "1px solid #fde68a", padding: "6px 8px", borderRadius: 8, color: "#92400e", fontWeight: 700 }}>
              Profit: {profit > 0 ? `${profit} gold` : `${profit} gold`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
