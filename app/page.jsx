"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";

export default function HomePage() {
  const [marketData, setMarketData] = useState(null);
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  async function fetchMarketData() {
    try {
      const res = await fetch("https://api.nomstead.com/open/marketplace");
      const data = await res.json();
      setMarketData(data);
    } catch (err) {
      console.error("Error loading marketplace:", err);
    }
  }

  useEffect(() => {
    fetchMarketData();
  }, []);

  function prettifySlug(slug) {
    if (!slug) return "";
    const tokens = slug.replace(/[-_]+/g, " ").split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return slug;

    const lower = tokens.map((t) => t.toLowerCase());
    const priority = [
      "wood", "stone", "iron", "gold", "cotton", "plank", "planks",
      "bread", "carrot", "seed", "thread", "sword", "staff", "potion", "gem", "leather"
    ];
    const matIndex = lower.findIndex((t) => priority.includes(t));
    if (matIndex > -1) {
      const tok = tokens.splice(matIndex, 1)[0];
      tokens.unshift(tok);
    }
    return tokens
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
      .join(" ");
  }

  if (!marketData) return <p style={{ padding: 20 }}>Indlæser Nomstead marketplace… ⏳</p>;

  const toBuy = (marketData?.toBuy ?? []).map((it) => ({
    ...it,
    __type: "BUY",
    quantityAvailable: it?.pricing?.availableQuantity ?? 0
  }));
  const toSell = (marketData?.toSell ?? []).map((it) => ({
    ...it,
    __type: "SELL",
    quantityAvailable: it?.pricing?.desiredQuantity ?? 0
  }));

  const allItems = [...toBuy, ...toSell];

  // Gruppering
  const grouped = useMemo(() => {
    const g = {};
    allItems.forEach((item) => {
      const cat = item.object?.category || "Other";
      const sub = item.object?.subCategory || "Misc";
      if (!g[cat]) g[cat] = {};
      if (!g[cat][sub]) g[cat][sub] = [];
      g[cat][sub].push(item);
    });
    return g;
  }, [marketData]);

  // Søgeforslag (dropdown)
  const suggestions = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return [];
    const map = new Map();
    for (const it of allItems) {
      const pretty = prettifySlug(it.object?.slug ?? "").toLowerCase();
      if (pretty.includes(q) || (it.object?.slug ?? "").toLowerCase().includes(q)) {
        if (!map.has(it.object.slug)) map.set(it.object.slug, it);
      }
      if (map.size >= 8) break;
    }
    return Array.from(map.values());
  }, [allItems, search]);

  const searchResults = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return [];
    return allItems.filter((it) => {
      const pretty = prettifySlug(it.object?.slug ?? "").toLowerCase();
      return pretty.includes(q) || (it.object?.slug ?? "").toLowerCase().includes(q);
    });
  }, [allItems, search]);

  function applySuggestion(it) {
    setSearch(prettifySlug(it.object?.slug ?? ""));
    setShowSuggestions(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAll = () => {
    const expand = !allExpanded;
    const newCats = {};
    const newSubs = {};
    Object.keys(grouped).forEach((cat) => {
      newCats[cat] = expand;
      Object.keys(grouped[cat]).forEach((sub) => {
        newSubs[sub] = expand;
      });
    });
    setOpenCategories(newCats);
    setOpenSubcategories(newSubs);
    setAllExpanded(expand);
  };

  return (
    <div style={{ maxWidth: 960, margin: "8px auto", padding: 12, fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>🏛️ Nomstead Open Marketplace</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div ref={inputRef} style={{ position: "relative", flex: 1 }}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Søg fx 'wo' → forslag dukker op..."
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "#fff", border: "1px solid #ccc", borderRadius: 8,
              marginTop: 4, listStyle: "none", padding: 0, zIndex: 10, maxHeight: 250, overflowY: "auto"
            }}>
              {suggestions.map((s) => (
                <li key={s.object?.slug} onClick={() => applySuggestion(s)}
                    style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, cursor: "pointer", borderBottom: "1px solid #eee" }}>
                  <img src={s.object?.thumbnailImageUrl || s.object?.imageUrl || "/favicon.ico"} alt={s.object?.slug}
                       style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                  <div>{prettifySlug(s.object?.slug)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={toggleAll} style={{ background: "#1d4ed8", color: "#fff", borderRadius: 8, padding: "10px 12px", border: "none" }}>
          {allExpanded ? "Sammenfold ▲" : "Fold ud ▼"}
        </button>

        <button onClick={fetchMarketData} style={{ background: "#f59e0b", color: "#fff", borderRadius: 8, padding: "10px 12px", border: "none" }}>
          🔄 Refresh
        </button>
      </div>

      {search ? (
        <section>
          <h2>Søgeresultater: {search}</h2>
          {searchResults.map((it, i) => (
            <ItemCard key={(it.object?.slug ?? i) + i} item={it} prettify={prettifySlug} />
          ))}
        </section>
      ) : (
        Object.entries(grouped).map(([cat, subs]) => (
          <section key={cat} style={{ marginBottom: 18 }}>
            <div onClick={() => setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}
                 style={{ cursor: "pointer", background: "#eef2ff", padding: 10, borderRadius: 8 }}>
              <b>{openCategories[cat] ? "▼" : "▶"} {cat}</b>
            </div>
            {openCategories[cat] && (
              <div style={{ marginTop: 8 }}>
                {Object.entries(subs).map(([sub, items]) => (
                  <div key={sub}>
                    <div onClick={() => setOpenSubcategories(prev => ({ ...prev, [sub]: !prev[sub] }))}
                         style={{ cursor: "pointer", background: "#ecfdf5", padding: 8, borderRadius: 8 }}>
                      <b>{openSubcategories[sub] ? "▼" : "▶"} {sub}</b>
                    </div>
                    {openSubcategories[sub] && (
                      <div style={{ marginTop: 6 }}>
                        {items.map((it, i) => (
                          <ItemCard key={(it.object?.slug ?? i) + i} item={it} prettify={prettifySlug} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function ItemCard({ item, prettify }) {
  const [qty, setQty] = useState(1);
  const unitPrice = item.pricing?.unitPrice ?? 0;
  const total = (Number(unitPrice) * Number(qty || 0)).toFixed(2);
  const isSell = item.__type === "SELL";
  const color = isSell ? "#92400e" : "#047857";
  const quantityAvailable = item.quantityAvailable ?? 0;

  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start", background
