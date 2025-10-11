"use client";
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/Tabs";
import DonateSection from "./components/DonateSection";
import SearchResults from "./searchResults";

export default function Home() {
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <main>
      <SearchBar setResults={setResults} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <SearchResults results={results} activeTab={activeTab} />
      <DonateSection />
    </main>
  );
}