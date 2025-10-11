"use client";
export default function DonateSnippet() {
  const address = "0x139a92c3Cad0CBe6b8F9C6b2365CC31bE164e341";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    alert("Address copied to clipboard!");
  };

  return (
    <div style={{
      textAlign: "center",
      marginTop: 40,
      paddingTop: 20,
      borderTop: "1px solid #333",
      color: "#bbb",
    }}>
      <p>Support the project here:</p>
      <p>USDC or ETH on Ethereum, Polygon, Arbitrum or Immutable zkEVM.</p>
      <p>Network address: {address}</p>
      <button onClick={copyToClipboard}>Copy address</button>
    </div>
  );
}