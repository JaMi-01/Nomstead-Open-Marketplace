import "./globals.css";

export const metadata = {
  title: "Nomstead Open Marketplace",
  description: "Trade smart. Earn gold. Explore opportunities."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <header className="header">
          <h1 style={{ margin: 0 }}>Nomstead Open Marketplace</h1>
          <p style={{ marginTop: 6, opacity: 0.95 }}>Trade smart. Earn gold. Explore opportunities.</p>
        </header>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
