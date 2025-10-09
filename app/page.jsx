"use client";
import { useState, useEffect } from "react";

// Helper: prettier names (Wood Flamingo / Carrot Seed osv.)
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

  // Group items by category/subcategory
  const categories = {};
  [...items.toBuy, ...items.toSell].forEach((item) => {
    const cat = item.object.category || "Uncategorized";
    const sub = item.object.subCategory || "Misc";
    if (!categories[cat]) categories[cat] = {};
    if (!categories[cat][sub]) categories[cat][sub] = [];
    categories[cat][sub].push(item);
  });

  const handleSelectSuggestion = (val) => {
    setSearch(val);
    setSuggestions([]); // dropdown forsvinder når valgt
  };

  const expandAll = () => setShowAllCategories(true);
  const collapseAll = () => setShowAllCategories(false);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ textAlign: "center", color: "#047857", marginBottom: 16 }}>
        Nomstead Open Marketplace
      </h1>

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
          {[...items.toBuy, ...items.toSell]
            .filter(i => prettify(i.object.slug).toLowerCase() === search.toLowerCase())
            .map(item => (
              <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />
            ))}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button onClick={expandAll} style={{ marginRight: 8, padding: 6 }}>Expand All</button>
            <button onClick={collapseAll} style={{ padding: 6 }}>Collapse All</button>
          </div>
          {Object.keys(categories).map(cat => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <h2 style={{ color: "#1e3a8a" }}>{cat}</h2>
              {Object.keys(categories[cat]).map(sub => (
                <details key={sub} open={showAllCategories} style={{ marginLeft: 16 }}>
                  <summary>{sub}</summary>
                  {categories[cat][sub].map(item => (
                    <ItemCard key={item.tile.url + item.object.slug + item.__type} item={item} prettify={prettify} />
                  ))}
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
      background: "#f9fafb",
      border: `1px solid ${isSell ? "#fcd34d" : "#34d399"}`,
      borderRadius: 8,
      padding: 10,
      marginBottom: 8
    }}>
      <img
        src={item.object?.thumbnailImageUrl || item.object?.imageUrl || "/favicon.ico"}
        alt={item.object?.slug}
        style={{ width: 50, height: 50, borderRadius: 6, objectFit: "cover" }}
      />
      <div style={{ flex: 1 }}>
        <b style={{ color }}>{prettify(item.object?.slug)}</b>
        <div style={{ fontSize: 12, color: "#555" }}>
          Category: {item.object?.category} / {item.object?.subCategory}
        </div>
        <div style={{ fontSize: 12 }}>
          Owner: <a href={item.tile?.url} target="_blank" rel="noreferrer">{item.tile?.owner}</a>
        </div>
        <div style={{ fontSize: 12 }}>
          Unit Price: {unitPrice} gold | Quantity: {quantityAvailable}
        </div>
        <div style={{ marginTop: 4 }}>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={{ width: 60, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
          /> × {unitPrice} gold = <b>{total} gold</b>
        </div>
      </div>
    </div>
  );
}
