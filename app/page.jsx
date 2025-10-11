"use client";
import { useEffect, useState } from "react";
import Tabs from "./components/Tabs";
import ItemCard from "./components/ItemCard";
import ProfitCard from "./components/ProfitCard";
import SearchBar from "./components/SearchBar";
import DonateSnippet from "./components/DonateSnippet";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("buy");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("https://api.nomstead.com/open/marketplace");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.object.category || "Misc";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const expandAll = () => {
    const all = {};
    Object.keys(grouped).forEach((k) => (all[k] = true));
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  const toggleExpand = (cat) =>
    setExpanded((p) => ({ ...p, [cat]: !p[cat] }));

  const profitItems = items
    .map((item) => {
      const buys = item.toBuy || [];
      const sells = item.toSell || [];
      if (!buys.length || !sells.length) return null;

      const lowestBuy = Math.min(...buys.map((b) => b.unitPrice));
      const highestSell = Math.max(...sells.map((s) => s.unitPrice));
      const profit = highestSell - lowestBuy;

      if (profit <= 0) return null;
      return { ...item, profit, lowestBuy, highestSell };
    })
    .filter(Boolean);

  return (
    <div>
      <SearchBar />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={["buy", "sell", "profit"]} />

      <div style={{ marginBottom: 12, textAlign: "center" }}>
        <button onClick={fetchData}>Refresh</button>
        <button onClick={expandAll} style={{ marginLeft: 8 }}>Expand All</button>
        <button onClick={collapseAll} style={{ marginLeft: 8 }}>Collapse All</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading data...</p>
      ) : activeTab === "profit" ? (
        profitItems.length === 0 ? (
          <p style={{ textAlign: "center" }}>No items with profit at the moment.</p>
        ) : (
          profitItems.map((item, idx) => <ProfitCard key={idx} item={item} />)
        )
      ) : (
        Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <h2 onClick={() => toggleExpand(cat)} style={{ cursor: "pointer" }}>
              {expanded[cat] ? "▼" : "▶"} {cat}
            </h2>
            {expanded[cat] &&
              list.map((item, idx) => (
                <ItemCard key={idx} item={item} type={activeTab} />
              ))}
          </div>
        ))
      )}
      <DonateSnippet />
    </div>
  );
}