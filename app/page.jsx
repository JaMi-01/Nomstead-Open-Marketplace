"use client";
import { useState, useEffect } from "react";

// Helper: prettier names (Wood Plank / Carrot Seed osv.)
const prettify = (str) => {
  if (!str) return "";
  const words = str.replace(/_/g, " ").split(" ");
  if (words.length === 2) return `${words[1]} ${words[0]}`;
  if (words.length > 2) return `${words.slice(1).join(" ")} ${words[0]}`;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Fetch Nomstead Marketplace
const fetchItems = async () => {
  const res = await fetch("https://api.nomstead.com/open/marketplace");
  if (!res.ok) throw new Error("Failed fetching marketplace");
  const data = await res.json();

  const toBuy = data.toBuy.map((item) => ({
    ...item,
    __type: "BUY",
    quantityAvailable: item.pricing?.availableQuantity,
  }));

  const toSell = data.toSell.map((item) => ({
    ...item,
    __type: "SELL",
    quantityAvailable: item.pricing?.desiredQuantity,
  }));

  return { toBuy, toSell };
};

export default function Page() {
  const [items, setItems] = useState({ toBuy: [], toSell: [] });
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Smart suggestions for search
  useEffect(() => {
    if (!search) return setSuggestions([]);
    const allItems = [...items.toBuy, ...items.toSell];
    const filtered = allItems
      .filter(i => prettify(i.object.slug).toLowerCase().includes(search.toLowerCase()))
      .map(i => prettify(i.object.slug));
    setSuggestions([...new Set(filtered)].slice(0, 10));
  }, [search, items]);

  const handleSelectSuggestion = (val) => {
    setSearch(val);
    setSuggestions([]); // dropdown forsvinder når valgt
  };

  const expandAll = () => setShowAllCategories(true);
  const collapseAll = () => setShowAllCategories(false);

  // Group items by category/subcategory
  const categories = {};
  [...items.toBuy, ...items.toSell].forEach((item) => {
    const cat = item.object.category || "Uncategorized";
    const sub = item.object.subCategory || "Misc";
    if (!categories[cat]) categories[cat] = {};
    if (!categories[cat][sub]) categories[cat][sub] = [];
    categories[cat][sub].push(item);
  });

  // Sort items inside categories
  Object.keys(categories).forEach(cat => {
    Object.keys(categories[cat]).forEach(sub => {
      categories[cat][sub] = categories[cat][sub].sort((a, b) => {
        if (a.__type === "BUY") return a.pricing.unitPrice - b.pricing.unitPrice;
        return b.pricing.unitPrice - a.pricing.unitPrice;
      });
    });
  });

  // Search display
  const searchItems = (name) => {
    const buy = items.toBuy
      .filter(i => prettify(i.object.slug).toLowerCase() === name.toLowerCase())
      .sort((a, b) => a.pricing.unitPrice - b.pricing.unitPrice);
    const sell = items.toSell
      .filter(i => prettify(i.object.slug).toLowerCase() === name.toLowerCase())
      .sort((a, b) => b.pricing.unitPrice - a.pricing.unitPrice);
    return { buy, sell };
  };

  return (
    <div style={{ padding: 16, fontFamily: "Arial, sans-serif", background: "#fdf6e3" }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        padding: 20,
        background: "linear-gradient(90deg, #047857, #10b981)",
        color: "white",
        borderRadius: 8,
        marginBottom: 16
      }}>
        <h1 style={{ margin: 0, fontSize: "2em" }}>Nomstead Open Marketplace</h1>
        <p style={{ marginTop: 4 }}>Find the best buy and sell opportunities in Nomstead</p>
      </div>

      {/* Search + Refresh */}
      <div style={{ marginBottom: 12, position: "relative" }}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 6, width: 200 }}
        />
        <button onClick={loadData} style={{ marginLeft: 8, padding: 6 }}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

        {suggestions.length > 0 && (
          <div style={{
            border: "1px solid #ccc",
            padding: 4,
            background: "#fff",
            position: "absolute",
            zIndex: 10,
            width: 200
          }}>
            {suggestions.map(s => (
              <div key={s} style={{ cursor: "pointer" }} onClick={() => handleSelectSuggestion(s)}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {search ? (
        <div>
          <button onClick={() => setSearch("")} style={{ marginBottom: 12, padding: 6 }}>
            Back to homepage
          </button>
          {(() => {
            const { buy, sell } = searchItems(search);
            return (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <h3>Buy Orders (Green)</h3>
                  {buy.map(item => <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3>Sell Orders (Gold)</h3>
                  {sell.map(item => <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />)}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div>
          {/* Expand/Collapse buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={expandAll} style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#34d399",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}>Expand All</button>
            <button onClick={collapseAll} style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#fcd34d",
              color: "#92400e",
              fontWeight: "bold",
              cursor: "pointer"
            }}>Collapse All</button>
          </div>

          {/* Categories */}
          {Object.keys(categories).map(cat => (
            <div key={cat} style={{ marginBottom: 24, background: "#fef3c7", padding: 12, borderRadius: 8 }}>
              <h2 style={{ color: "#b45309", marginBottom: 8 }}>{cat}</h2>
              {Object.keys(categories[cat]).map(sub => (
                <details key={sub} open={showAllCategories} style={{ marginLeft: 16 }}>
                  <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: 4 }}>{sub}</summary>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                    {categories[cat][sub].filter(i => i.__type === "BUY").map(item =>
                      <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />)}
                    {categories[cat][sub].filter(i => i.__type === "SELL").map(item =>
                      <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />)}
                  </div>
                </details>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, prettify }) {
  const [qty, setQty] = useState(1);
  const unitPrice = item.pricing?.unitPrice ?? 0;
  const total = (Number(unitPrice) * Number(qty || 0)).toFixed(2);
  const isSell = item.__type === "SELL";
  const color = isSell ? "#92400e" : "#047857"; // guld / grøn
  const quantityAvailable = item.quantityAvailable ?? 0;

  return (
    <div style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      background: "#fff",
      border: `1px solid ${isSell ? "#fcd34d" : "#34d399"}`,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
      minWidth: 200,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <img
        src={item.object?.thumbnailImageUrl || item.object?.imageUrl || "/favicon.ico"}
        alt={item.object?.slug}
        style={{ width: 50, height
