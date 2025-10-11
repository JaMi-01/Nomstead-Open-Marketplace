"use client";
import ItemCard from "./components/ItemCard";
import { useMemo } from "react";

/*
  props:
   - query (string)
   - market: { toBuy: [], toSell: [] }
   - prettify (fn)
   - onBack (fn)
   - selectedTab, setSelectedTab
*/
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

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} className="btn">← Back to homepage</button>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "#333" }}>Results for <b>{query}</b></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <button onClick={() => setSelectedTab("BUY")} className={`tab ${selectedTab === "BUY" ? "active buy" : ""}`}>Buy</button>
        <button onClick={() => setSelectedTab("SELL")} className={`tab ${selectedTab === "SELL" ? "active sell" : ""}`}>Sell</button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {selectedTab === "BUY" ? (
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ color: "#047857" }}>Buy (lowest first)</h3>
            {buys.length ? buys.map(i => <ItemCard key={`${i.tile?.url}-${i.object?.slug}-b`} item={i} mode="BUY" prettify={prettify} />) : <div className="small">No buy orders found.</div>}
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 300 }}>
            <h3 style={{ color: "#92400e" }}>Sell (highest first)</h3>
            {sells.length ? sells.map(i => <ItemCard key={`${i.tile?.url}-${i.object?.slug}-s`} item={i} mode="SELL" prettify={prettify} />) : <div className="small">No sell orders found.</div>}
          </div>
        )}
      </div>
    </section>
  );
}
