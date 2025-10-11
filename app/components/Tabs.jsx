export default function Tabs({ activeTab, setActiveTab, tabs }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          style={{
            background: activeTab === t ? "#4fa3ff" : "#333",
            marginRight: 10,
          }}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  );
}