"use client";
import { useState, useEffect } from "react";
import ItemCard from "./components/ItemCard";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/Tabs";

export default function SearchResults({ searchParams }) {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("buy");

  useEffect(() => {
    fetch("https://api.nomstead.com/open/marketplace")
      .then((r) => r.json())
      .then((d) => setItems(d));
  }, []);

  const term = (searchParams?.q || "").toLowerCase();
  const results = items.filter((i) =>
    i.object.slug.toLowerCase().includes(term)
  );

  return (
    <div>
      <SearchBar />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={["buy", "sell"]} />

      <button onClick={() => (window.location.href = "/")} style={{ marginBottom: 16 }}>
        Back to homepage
      </button>

      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        results.map((item, i) => (
          <ItemCard key={i} item={item} type={activeTab} />
        ))
      )}
    </div>
  );
}