export default function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["buy", "sell", "profit"];

  return (
    <div style={{ marginTop: "1rem" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            backgroundColor: activeTab === tab ? "#2563eb" : "#e5e7eb",
            color: activeTab === tab ? "white" : "#333",
            margin: "0 5px"
          }}
        >
          {tab.toUpperCase()}
        </button>
      ))}
    </div>
  );
}