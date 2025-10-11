export const metadata = {
  title: "Nomstead Open Marketplace",
  description: "Community-driven marketplace tracker for Nomstead players.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{
          textAlign: "center",
          padding: "20px",
          background: "linear-gradient(90deg, #0a0a0a, #1f1f1f)",
          color: "white",
        }}>
          <h1 style={{ margin: 0 }}>Nomstead Open Marketplace</h1>
          <em style={{ fontSize: "0.9em", color: "#ccc" }}>Version 2.5</em>

          <div style={{ marginTop: "10px", fontSize: "0.8em", color: "#aaa" }}>
            <p>Created by: ChatGPT</p>
            <p>Vision by: <a href="https://x.com/jamionfire?s=21" target="_blank" style={{ color: "#4fa3ff" }}>JaMi</a></p>
            <p>Build on: <a href="https://github.com/JaMi-01/Nomstead-Open-Marketplace" target="_blank" style={{ color: "#4fa3ff" }}>GitHub</a></p>
            <p>Hosted on: <a href="https://vercel.com" target="_blank" style={{ color: "#4fa3ff" }}>Vercel</a></p>
          </div>
        </header>

        <main style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}