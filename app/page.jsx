"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import ItemCard from "./itemCard";

/* ---------------- prettify slug ---------------- */
function prettifySlug(slug) {
  if (!slug) return "";
  const parts = slug.replace(/[-_]+/g, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() + parts[0].slice(1);
  const priority = ["wood","stone","iron","gold","cotton","plank","planks","seed","thread","carrot"];
  const low = parts.map(p => p.toLowerCase());
  const idx = low.findIndex(p => priority.includes(p));
  if (idx > -1) {
    const tok = parts.splice(idx,1)[0];
    parts.unshift(tok);
  }
  if (parts[0]?.toLowerCase() === "seed" && parts.length > 1) parts.push(parts.shift());
  return parts.map(p => p[0]?.toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

/* ---------------- fetch marketplace ---------------- */
async function fetchMarketplace() {
  const res = await fetch("https://api.nomstead.com/open/marketplace");
  if (!res.ok) throw new Error("Failed to fetch marketplace");
  const data = await res.json();
  const toBuy = (data?.toBuy ?? []).map(x => ({ ...x, __type: "BUY", quantityAvailable: x.pricing?.availableQuantity ?? 0 }));
  const toSell = (data?.toSell ?? []).map(x => ({ ...x, __type: "SELL", quantityAvailable: x.pricing?.desiredQuantity ?? 0 }));
  return { toBuy, toSell };
}

/* ---------------- Main component ---------------- */
export default function Page() {
  const [market, setMarket] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("BUY"); // controls Buy/Sell both front & search
  const [showAll, setShowAll] = useState(false);

  const inputWrapRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMarketplace();
      setMarket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const data = await fetchMarketplace();
      setMarket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }

  const allItems = useMemo(() => [...(market.toBuy ?? []), ...(market.toSell ?? [])], [market]);

  // suggestions while typing
  useEffect(() => {
    if (!query || query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const q = query.trim().toLowerCase();
    const seen = new Set();
    const list = [];
    for (const it of allItems) {
      const pretty = prettifySlug(it.object?.slug ?? "").toLowerCase();
      if ((pretty.includes(q) || (it.object?.slug ?? "").toLowerCase().includes(q)) && !seen.has(pretty)) {
        seen.add(pretty);
        list.push(prettifySlug(it.object?.slug ?? ""));
      }
      if (list.length >= 10) break;
    }
    setSuggestions(list);
  }, [query, allItems]);

  // click outside to hide suggestions
  useEffect(() => {
    function onDoc(e) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function selectSuggestion(val) {
    setQuery(val);
    setSuggestions([]);
  }

  // group by category/subcategory
  const grouped = useMemo(() => {
    const g = {};
    for (const it of allItems) {
      const cat = it.object?.category ?? "Uncategorized";
      const sub = it.object?.subCategory ?? "Misc";
      if (!g[cat]) g[cat] = {};
      if (!g[cat][sub]) g[cat][sub] = [];
      g[cat][sub].push(it);
    }
    // sort lists: buys asc, sells desc
    for (const cat of Object.keys(g)) {
      for (const sub of Object.keys(g[cat])) {
        g[cat][sub].sort((a,b) => {
          if (a.__type === b.__type) {
            if (a.__type === "BUY") return (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0);
            return (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0);
          }
          return a.__type === "BUY" ? -1 : 1;
        });
      }
    }
    return g;
  }, [allItems]);

  // search results helpers
  function searchResultsByName(name) {
    const n = (name ?? "").trim().toLowerCase();
    const buys = (market.toBuy ?? []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0));
    const sells = (market.toSell ?? []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0));
    return { buys, sells };
  }

  function profitPotentialForSlug(name) {
    const { buys, sells } = searchResultsByName(name);
    if (!buys.length || !sells.length) return null;
    const cheapest = buys[0].pricing?.unitPrice ?? 0;
    const highest = sells[0].pricing?.unitPrice ?? 0;
    return Number((highest - cheapest).toFixed(2));
  }

  /* ------------------- RENDER ------------------- */
  return (
    <main style={{ minHeight: "100vh", background: "#fdf6e3", padding: 16, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial" }}>
      {/* header */}
      <header style={{
        maxWidth: 1200, margin: "0 auto 16px", padding: 20,
        borderRadius: 12, background: "linear-gradient(90deg,#047857,#10b981)", color: "#fff",
        boxShadow: "0 8px 30px rgba(2,6,23,0.12)"
      }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem" }}>🏰 Nomstead Open Marketplace</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.95 }}>Find the best buy/sell offers — search, compare and plan trades.</p>
      </header>

      {/* controls */}
      <section style={{ maxWidth: 1200, margin: "0 auto 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div ref={inputWrapRef} style={{ position: "relative", minWidth: 260 }}>
          <input
            aria-label="Search items"
            placeholder="Søg fx 'wo' → Wood Plank..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 300, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          />
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, width: 300,
              background: "#fff", border: "1px solid #eee", borderRadius: 8, boxShadow: "0 10px 30px rgba(2,6,23,0.08)", zIndex: 60, maxHeight: 320, overflowY: "auto"
            }}>
              {suggestions.map(s => (
                <div key={s} onClick={() => selectSuggestion(s)} style={{ padding: 10, cursor: "pointer", borderBottom: "1px solid #fafafa" }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button onClick={refresh} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#fff", boxShadow: "0 4px 12px rgba(2,6,23,0.06)" }}>
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* global tabs used on both front and search */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setSelectedTab("BUY")} style={{ padding: "8px 12px", borderRadius: 8, border: selectedTab === "BUY" ? "2px solid #047857" : "1px solid #eee", background: selectedTab === "BUY" ? "#ecfdf5" : "#fff" }}>Buy</button>
          <button onClick={() => setSelectedTab("SELL")} style={{ padding: "8px 12px", borderRadius: 8, border: selectedTab === "SELL" ? "2px solid #92400e" : "1px solid #eee", background: selectedTab === "SELL" ? "#fff7ed" : "#fff" }}>Sell</button>
        </div>
      </section>

      {/* content */}
      <section style={{ maxWidth: 1200, margin: "0 auto" }}>
        {loading ? <div>Indlæser marketplace…</div> : null}

        {/* SEARCH MODE */}
        {query && query.trim() !== "" ? (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button onClick={() => { setQuery(""); setSuggestions([]); }} style={{ padding: "8px 12px", borderRadius: 8 }}>← Back to homepage</button>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#333" }}>Showing results for <b>{query}</b></div>
                <div style={{ fontSize: 14, color: "#b45309" }}>
                  {(profitPotentialForSlug(query) !== null) ? `Potential profit: ${profitPotentialForSlug(query)} gold` : ""}
                </div>
              </div>
            </div>

            {/* Show either Buy or Sell based on selectedTab (Buy default) */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {selectedTab === "BUY" ? (
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3 style={{ color: "#047857", marginTop: 0 }}>Buy (lowest first)</h3>
                  {searchResultsByName(query).buys.map(i => <ItemCard key={`${i.tile?.url}-${i.object?.slug}-BUY`} item={i} prettify={prettifySlug} />)}
                  {searchResultsByName(query).buys.length === 0 && <div style={{ color: "#666" }}>Ingen buy-ordre fundet</div>}
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3 style={{ color: "#92400e", marginTop: 0 }}>Sell (highest first)</h3>
                  {searchResultsByName(query).sells.map(i => {
                    const profit = profitPotentialForSlug(query);
                    return <ItemCard key={`${i.tile?.url}-${i.object?.slug}-SELL`} item={i} prettify={prettifySlug} profit={profit} />;
                  })}
                  {searchResultsByName(query).sells.length === 0 && <div style={{ color: "#666" }}>Ingen sell-ordre fundet</div>}
                </div>
              )}
            </div>
          </section>
        ) : (
          /* FRONT PAGE */
          <section>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => setShowAll(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#34d399", color: "#fff", fontWeight: 700 }}>Expand All</button>
              <button onClick={() => setShowAll(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#fcd34d", color: "#92400e", fontWeight: 700 }}>Collapse All</button>
            </div>

            {Object.entries(grouped).map(([cat, subs]) => (
              <div key={cat} style={{ marginBottom: 24, background: "#fffaf0", padding: 12, borderRadius: 10 }}>
                <h2 style={{ margin: 0, color: "#b45309" }}>{cat}</h2>

                {Object.entries(subs).map(([sub, list]) => {
                  // build lists for selected tab and slice top10
                  const buys = list.filter(i => i.__type === "BUY").sort((a,b) => (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0));
                  const sells = list.filter(i => i.__type === "SELL").sort((a,b) => (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0));
                  const shown = selectedTab === "BUY" ? buys.slice(0, 10) : sells.slice(0, 10);

                  return (
                    <details key={sub} open={showAll} style={{ marginLeft: 12, marginTop: 8 }}>
                      <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                        {sub} <span style={{ color: "#666", fontWeight: 400 }}>({list.length})</span>
                      </summary>

                      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                        {shown.length === 0 && <div style={{ color: "#666" }}>Ingen {selectedTab === "BUY" ? "buy" : "sell"} items</div>}
                        {shown.map(i => {
                          const profit = selectedTab === "SELL" ? profitPotentialForSlug(prettifySlug(i.object?.slug)) : null;
                          return <ItemCard key={`${i.tile?.url}-${i.object?.slug}-${i.__type}`} item={i} prettify={prettifySlug} profit={profit} />;
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            ))}
          </section>
        )}
      </section>
    </main>
  );

  /* ------------- helper functions inside component ------------- */

  function searchResultsByName(name) {
    const n = (name ?? "").trim().toLowerCase();
    const buys = (market.toBuy || []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0));
    const sells = (market.toSell || []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0));
    return { buys, sells };
  }

  function profitPotentialForSlug(name) {
    const { buys, sells } = searchResultsByName(name);
    if (!buys.length || !sells.length) return null;
    const cheapest = buys[0].pricing?.unitPrice ?? 0;
    const highest = sells[0].pricing?.unitPrice ?? 0;
    return Number((highest - cheapest).toFixed(2));
  }
}
