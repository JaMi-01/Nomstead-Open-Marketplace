export const metadata = {
  title: "Nomstead Open Marketplace v2.4",
  description: "Open trading data from Nomstead kingdoms"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>NOMSTEAD OPEN MARKETPLACE</h1>
          <p className="version">Version 2.4</p>
        </header>
        {children}
        <footer>
          <p>
            Created by: ChatGPT<br />
            Vision by: <a href="https://x.com/jamionfire?s=21" target="_blank">JaMi</a><br />
            Build on: <a href="https://github.com/JaMi-01/Nomstead-Open-Marketplace" target="_blank">GitHub</a><br />
            Hosted on: <a href="https://vercel.com" target="_blank">Vercel</a>
          </p>
        </footer>
      </body>
    </html>
  );
}