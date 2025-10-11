"use client";
import { useState } from "react";

export default function DonateSection() {
  const [network, setNetwork] = useState("");
  const [token, setToken] = useState("");
  const wallet = "0x139a92c3Cad0CBe6b8F9C6b2365CC31bE164e341";

  const networks = ["Ethereum", "Polygon", "Arbitrum", "Immutable zkEVM"];
  const tokens = ["ETH", "USDC"];

  return (
    <div style={{ marginTop: "2rem", background: "#f1f5f9", padding: "1rem", borderRadius: "10px" }}>
      <p><strong>Support this project here:</strong></p>

      <div style={{ margin: "0.5rem" }}>
        <select value={network} onChange={(e) => setNetwork(e.target.value)}>
          <option value="">Select Network</option>
          {networks.map((n) => <option key={n}>{n}</option>)}
        </select>

        <select value={token} onChange={(e) => setToken(e.target.value)} style={{ marginLeft: "1rem" }}>
          <option value="">Select Token</option>
          {tokens.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <button disabled={!network || !token} style={{ background: "#2563eb", color: "white" }}>
        Donate {token || ""} on {network || ""}
      </button>

      <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
        Wallet address: {wallet}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#555" }}>
        Send only ETH or USDC on the selected network.
      </p>
    </div>
  );
}