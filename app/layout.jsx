export const metadata = {
  title: "Nomstead Open Marketplace",
  description: "Find, compare and trade Nomstead items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <head />
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial" }}>
        {children}
      </body>
    </html>
  );
}
