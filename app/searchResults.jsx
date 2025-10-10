"use client";
import React, { useMemo, useState } from "react";
import ItemCard from "./itemCard";

export default function SearchResults({ query, market, prettify, onBack, selectedTab, setSelectedTab }) {
  const normalized = (query || "").trim().toLowerCase();

  const buys = useMemo(() => {
    return (market.toBuy || [])
      .filter(i => prettify(i.object?.slug).toLowerCase() === normalized)
      .sort((a,b) => (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0));
  }, [market.toBuy, normalized, prettify]);

  const sells = useMemo(() => {
    return (market.toSell || [])
      .filter(i => prettify(i.object?.slug).toLowerCase() === normalized)
      .sort((a,b) => (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0));
  }, [market.toSell, normalized, prettify]);

  // compute profit potential: highest sell - lowest buy (if both exist)
  const profitPotential = useMemo(() => {
    if (!buys.length || !sells.length) return null;
    const cheapest = buys[0].pricing?.unitPrice ?? 0;
    const highest = sells[0].pricing?.unitPrice ?? 0;
    return Number((highest - cheapest).toFixed(2));
  }, [buys, sells]);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <button onClick={onBack} style={{ padding: "8px 12px", borderRadius: 8 }}>← Back to homepage</button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "#333" }}>Results for <b>{query}</b></div>
          <div style={{ fontSize: 14, color: "#b45309" }}>
            {profitPotential === null ? "" : `Potential profit: ${profitPotential} gold`}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => setSelectedTab("BUY")} style={{ padding: "8px 12px", borderRadius: 8, border: selectedTab === "BUY" ? "2px solid #047857" : "1px solid #eee", background: selectedTab === "BUY" ? "#ecfdf5" : "#fff" }}>Buy</button>
            <button onClick={() => setSelectedTab("SELL")} style={{ padding: "8px 12px", borderRadius: 8, border: selectedTab === "SELL" ? "2px solid #92400e" : "1px solid #eee", background: selectedTab === "SELL" ? "#fff7ed" : "#fff" }}>Sell</button>
          </div>

          {selectedTab === "BUY" ? (
            <>
              <h3 style={{ color: "#047857", marginTop: 0 }}>Buy (lowest first)</h3>
              {buys.length ? buys.map(i => <ItemCard key={`${i.tile?.url}-${i.object?.slug}-BUY`} item={i} prettify={prettify} />) : <div style={{ color: "#666" }}>No buy orders found.</div>}
            </>
          ) : (
            <>
              <h3 style={{ color: "#92400e", marginTop: 0 }}>Sell (highest first)</h3>
              {sells.length ? sells.map(i => <ItemCard key={`${i.tile?.url}-${i.object?.slug}-SELL`} item={i} prettify={prettify} profit={profitPotential} />) : <div style={{ color: "#666" }}>No sell orders found.</div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
