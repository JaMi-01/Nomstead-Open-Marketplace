"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("https://api.nomstead.com/open/marketplace")
      .then((r) => r.json())
      .then((d) => setItems(d));
  }, []);

  const handleSearch = () => {
    if (query.trim()) router.push(`/searchResults?q=${query}`);
  };

  const handleSelect = (val) => {
    setQuery(val);
    setSuggestions([]);
    router.push(`/searchResults?q=${val}`);
  };

  useEffect(() => {
    if (query.length > 1) {
      const filtered = items
        .map((i) => i.object.name)
        .filter((n) => n.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else setSuggestions([]);
  }, [query]);

  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search for an item..."
        style={{ padding: "8px", width: "60%", borderRadius: "6px" }}
      />
      <button onClick={handleSearch} style={{ marginLeft: 10 }}>Search</button>
      {suggestions.length > 0 && (
        <div style={{
          background: "#333",
          borderRadius: 8,
          margin: "0 auto",
          width: "60%",
          marginTop: 5,
          textAlign: "left",
          padding: 5,
        }}>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => handleSelect(s)} style={{ cursor: "pointer" }}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}