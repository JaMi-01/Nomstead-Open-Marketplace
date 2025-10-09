export const metadata = {
  title: "Nomstead Open Marketplace",
  description: "View and trade items in Nomstead",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
