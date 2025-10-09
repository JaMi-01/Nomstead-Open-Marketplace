export const metadata = {
  title: "Nomstead Open Marketplace",
  description: "Live market overview of Nomstead's trading system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily: "sans-serif",
          margin: 0,
          padding: "20px"
        }}
      >
        <h1 style={{ textAlign: "center", color: "#1d4ed8" }}>
          🏰 Nomstead Open Marketplace
        </h1>
        {children}
      </body>
    </html>
  );
}
