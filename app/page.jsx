"use client";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [marketData, setMarketData] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://api.nomstead.com/open/marketplace");
        const data = await res.json();
        setMarketData(data);
      } catch (err) {
        console.error("Error loading marketplace:", err);
      }
    }
    fetchData();
  }, []);

  // Format item names (from seed_carrot → Carrot Seed)
  function formatName(slug) {
    return slug
      .split("_")
      .reverse()
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Handle search
  useEffect(() => {
    if (!marketData) return;
    const allItems = [...marketData.toBuy, ...marketData.toSell];
    const results = allItems.filter((item) =>
      item.object.slug.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(results);
  }, [search, marketData]);

  if (!marketData) return <p>Loading Nomstead marketplace...</p>;

  const toBuy = marketData.toBuy
    .sort((a, b) => a.pricing.unitPrice - b.pricing.unitPrice)
    .slice(0, 10);
  const toSell = marketData.toSell
    .sort((a, b) => b.pricing.unitPrice - a.pricing.unitPrice)
    .slice(0, 10);

  const displayItems = search ? filteredItems : [];

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <input
        type="text"
        placeholder="Search for items (try 'wood')..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
          border: "1px solid #ccc"
        }}
      />

      {search ? (
        <div>
          <h2>Search Results</h2>
          {displayItems.length === 0 && <p>No items found.</p>}
          {displayItems.map((item, i) => (
            <ItemCard key={i} item={item} />
          ))}
        </div>
      ) : (
        <>
          <Section title="🟢 Top 10 Buy Offers (Lowest Price)" items={toBuy} />
          <Section title="🟡 Top 10 Sell Offers (Highest Price)" items={toSell} sell />
        </>
      )}
    </div>
  );
}

function Section({ title, items, sell }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ color: sell ? "#b8860b" : "#047857" }}>{title}</h2>
      {items.map((item, i) => (
        <ItemCard key={i} item={item} sell={sell} />
      ))}
    </div>
  );
}

function ItemCard({ item, sell }) {
  const [quantity, setQuantity] = useState(1);
  const total = (quantity * item.pricing.unitPrice).toFixed(2);
  const color = sell ? "#b8860b" : "#047857";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={item.object.thumbnailImageUrl || item.object.imageUrl}
          alt={item.object.slug}
          style={{
            width: 40,
            height: 40,
            marginRight: 10,
            borderRadius: 5
          }}
        />
        <div>
          <strong style={{ fontSize: 16 }}>
            {formatName(item.object.slug)}
          </strong>
          <div style={{ fontSize: 13, color: "#555" }}>
            {item.object.category} → {item.object.subCategory}
          </div>
          <div style={{ fontSize: 13 }}>
            Owner:{" "}
            <a
              href={item.tile.url}
              target="_blank"
              style={{ color: color, textDecoration: "none" }}
            >
              {item.tile.owner}
            </a>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <span style={{ color: color, fontWeight: "bold" }}>
          💰 {item.pricing.unitPrice} gold each
        </span>
        <div style={{ marginTop: 5 }}>
          Qty:{" "}
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: 60 }}
          />{" "}
          → Total: <b>{total}</b> gold
        </div>
      </div>
    </div>
  );
}

function formatName(slug) {
  return slug
    .split("_")
    .reverse()
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
