"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ItemCard from "./components/ItemCard";
import ProfitCard from "./components/ProfitCard";
import SearchResults from "./searchResults";

/* prettify - convert slug to readable name */
function prettifySlug(slug) {
  if (!slug) return "";
  const parts = slug.replace(/[-_]+/g, " ").trim().split(/\s+/);
  // attempt to reorder common material words to front for nicer names
  const priority = ["wood","plank","planks","seed","cotton","stone","iron","gold","thread","carrot"];
  const low = parts.map(p => p.toLowerCase());
  const idx = low.findIndex(p => priority.includes(p));
  if (idx > -1 && idx !== 0) {
    const tok = parts.splice(idx,1)[0];
    parts.unshift(tok);
  }
  if (parts[0]?.toLowerCase() === "seed" && parts.length > 1) parts.push(parts.shift());
  return parts.map(p => p[0]?.toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

/* fetch marketplace */
async function fetchMarketplace() {
  const res = await fetch("https://api.nomstead.com/open/marketplace");
  if (!res.ok) throw new Error("Failed to fetch marketplace");
  const json = await res.json();
  // map quantities onto a single field quantityAvailable for uniformity
  const toBuy = (json.toBuy || []).map(x => ({ ...x, __type: "BUY", quantityAvailable: x.pricing?.availableQuantity ?? 0 }));
  const toSell = (json.toSell || []).map(x => ({ ...x, __type: "SELL", quantityAvailable: x.pricing?.desiredQuantity ?? 0 }));
  return { toBuy, toSell };
}

export default function Page() {
  const [market, setMarket] = useState({ toBuy: [], toSell: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState("BUY"); // global tab used on front & search
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

  const allItems = useMemo(() => [...(market.toBuy || []), ...(market.toSell || [])], [market]);

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

  // hide suggestions if click outside
  useEffect(() => {
    function onDoc(e) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // group by category/subcategory with sorting
  const grouped = useMemo(() => {
    const g = {};
    for (const it of allItems) {
      const cat = it.object?.category ?? "Uncategorized";
      const sub = it.object?.subCategory ?? "Misc";
      if (!g[cat]) g[cat] = {};
      if (!g[cat][sub]) g[cat][sub] = [];
      g[cat][sub].push(it);
    }
    for (const cat of Object.keys(g)) {
      for (const sub of Object.keys(g[cat])) {
        // sort: buys ascending, sells descending
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

  // profit items (front page only):
  const profitItems = useMemo(() => {
    // For each distinct slug, find lowest sell price (seller offers) and highest buy price (buyer offers)
    const bySlug = {};
    for (const s of market.toSell || []) {
      const slug = s.object?.slug;
      if (!slug) continue;
      if (!bySlug[slug]) bySlug[slug] = { sells: [], buys: [] };
      bySlug[slug].sells.push(s);
    }
    for (const b of market.toBuy || []) {
      const slug = b.object?.slug;
      if (!slug) continue;
      if (!bySlug[slug]) bySlug[slug] = { sells: [], buys: [] };
      bySlug[slug].buys.push(b);
    }

    const results = [];
    for (const slug of Object.keys(bySlug)) {
      const sells = bySlug[slug].sells;
      const buys = bySlug[slug].buys;
      if (!sells.length || !buys.length) continue;
      // lowest sell
      const lowestSell = sells.reduce((min, cur) => (cur.pricing?.unitPrice < (min.pricing?.unitPrice ?? Infinity) ? cur : min), sells[0]);
      // highest buy
      const highestBuy = buys.reduce((max, cur) => (cur.pricing?.unitPrice > (max.pricing?.unitPrice ?? -Infinity) ? cur : max), buys[0]);
      const profit = (highestBuy.pricing?.unitPrice ?? 0) - (lowestSell.pricing?.unitPrice ?? 0);
      if (profit > 0) {
        results.push({
          slug,
          name: prettifySlug(slug),
          buyPrice: lowestSell.pricing?.unitPrice ?? 0,
          sellPrice: highestBuy.pricing?.unitPrice ?? 0,
          buyQty: lowestSell.quantityAvailable ?? lowestSell.pricing?.availableQuantity ?? 0,
          sellQty: highestBuy.quantityAvailable ?? highestBuy.pricing?.availableQuantity ?? highestBuy.pricing?.desiredQuantity ?? 0,
          buyLink: lowestSell.tile?.url,
          sellLink: highestBuy.tile?.url,
          buySeller: lowestSell.tile?.owner,
          sellBuyer: highestBuy.tile?.owner,
          profitPerUnit: Number(profit.toFixed(4))
        });
      }
    }
    // sort by profit desc
    return results.sort((a,b) => b.profitPerUnit - a.profitPerUnit);
  }, [market]);

  // helper for top10 per category per selectedTab
  function topForList(list) {
    if (!list) return [];
    if (selectedTab === "BUY") {
      // already sorted ascending buys earlier; show lowest first -> slice 0..9
      return list.filter(i => i.__type === "BUY").slice(0,10);
    }
    if (selectedTab === "SELL") {
      return list.filter(i => i.__type === "SELL").slice(0,10);
    }
    return [];
  }

  // searchResultsByName helper
  function searchResultsByName(name) {
    const n = (name || "").trim().toLowerCase();
    const buys = (market.toBuy || []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (a.pricing?.unitPrice ?? 0) - (b.pricing?.unitPrice ?? 0));
    const sells = (market.toSell || []).filter(i => prettifySlug(i.object?.slug).toLowerCase() === n)
      .sort((a,b) => (b.pricing?.unitPrice ?? 0) - (a.pricing?.unitPrice ?? 0));
    return { buys, sells };
  }

  return (
    <main>
      <section className="controls">
        <div ref={inputWrapRef} className="search-wrap">
          <input
            aria-label="Search items"
            placeholder="Search (e.g. 'wo' → Wood Plank)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(s => (
                <div key={s} className="suggestion" onClick={() => { setQuery(s); setSuggestions([]); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="controls-right">
          <button onClick={refresh} className="btn refresh">{refreshing ? "Refreshing..." : "🔄 Refresh"}</button>

          <div className="tabs" role="tablist" aria-label="Buy Sell Profit tabs">
            <button className={`tab ${selectedTab === "BUY" ? "active buy" : ""}`} onClick={() => setSelectedTab("BUY")}>Buy</button>
            <button className={`tab ${selectedTab === "SELL" ? "active sell" : ""}`} onClick={() => setSelectedTab("SELL")}>Sell</button>
            <button className={`tab ${selectedTab === "PROFIT" ? "active profit" : ""}`} onClick={() => setSelectedTab("PROFIT")}>Profit</button>
          </div>
        </div>
      </section>

      <div className="top-buttons">
        <button className="btn expand" onClick={() => setShowAll(true)}>Expand All</button>
        <button className="btn collapse" onClick={() => setShowAll(false)}>Collapse All</button>
      </div>

      <section>
        {query && query.trim() !== "" ? (
          <SearchResults
            query={query}
            market={market}
            prettify={prettifySlug}
            onBack={() => { setQuery(""); setSuggestions([]); }}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ) : (
          <div>
            {/* PROFIT tab view on homepage */}
            {selectedTab === "PROFIT" ? (
              <div>
                {profitItems.length ? (
                  <div className="grid">
                    {profitItems.map((p, idx) => (
                      <ProfitCard key={p.slug + idx} item={{
                        name: p.name,
                        buyPrice: p.buyPrice,
                        sellPrice: p.sellPrice,
                        buyQty: p.buyQty,
                        sellQty: p.sellQty,
                        buyLink: p.buyLink,
                        sellLink: p.sellLink,
                        buySeller: p.buySeller,
                        sellBuyer: p.sellBuyer
                      }} />
                    ))}
                  </div>
                ) : (
                  <p>No items with profit at the moment.</p>
                )}
              </div>
            ) : (
              // BUY / SELL views: categories with subcategories; show top10 for selectedTab
              Object.keys(grouped).length === 0 ? <div className="small">No items in marketplace.</div> : (
                Object.entries(grouped).map(([cat, subs]) => (
                  <div key={cat} style={{ marginBottom: 24, background: "#fffaf0", padding: 12, borderRadius: 10 }}>
                    <h2 style={{ margin: 0, color: "#b45309" }}>{cat}</h2>
                    {Object.entries(subs).map(([sub, list]) => {
                      const shown = topForList(list);
                      return (
                        <details key={sub} open={showAll} style={{ marginLeft: 12, marginTop: 8 }}>
                          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                            {sub} <span style={{ color: "#666", fontWeight: 400 }}>({list.length})</span>
                          </summary>
                          <div style={{ marginTop: 10 }} className="grid">
                            {shown.length === 0 ? <div className="small">No {selectedTab === "BUY" ? "buy" : "sell"} items</div> : shown.map(i => (
                              <ItemCard key={`${i.tile?.url}-${i.object?.slug}-${i.__type}`} item={i} mode={selectedTab === "BUY" ? "BUY" : "SELL"} prettify={prettifySlug} />
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                ))
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
