"use client";
import ItemCard from "./components/ItemCard";
import ProfitCard from "./components/ProfitCard";

export default function SearchResults({ results, activeTab }) {
  if (!results.length) return null;

  const items = results.sort((a, b) => a.item.localeCompare(b.item));

  return (
    <section>
      {items.map((item, idx) => {
        if (activeTab === "profit") return <ProfitCard key={idx} item={item} />;
        return <ItemCard key={idx} item={item} type={activeTab} />;
      })}
    </section>
  );
}