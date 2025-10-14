'use client';
import './globals.css';
import DonateSnippet from './components/DonateSnippet';

export const metadata = {
  title: 'Nomstead Open Marketplace',
  description: 'Nomstead marketplace viewer - Buy, Sell, Profit'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-white to-[#fdf6e3] min-h-screen text-gray-800">
        <header className="bg-white shadow-sm py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold">Nomstead Open Marketplace</h1>
            <p className="text-sm italic text-gray-600 mt-1">Version 3.8</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 mt-6">{children}</main>

        <footer className="max-w-6xl mx-auto px-4 mt-10 mb-10 text-center text-sm text-gray-500 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
            <div><strong>Created by:</strong> ChatGPT</div>
            <div><strong>Vision by:</strong> <a className="text-blue-600 underline" href="https://x.com/jamionfire?s=21" target="_blank" rel="noreferrer">JaMi</a></div>
            <div><strong>Build on:</strong> <a className="text-blue-600 underline" href="https://github.com/JaMi-01/Nomstead-Open-Marketplace" target="_blank" rel="noreferrer">GitHub</a></div>
            <div><strong>Hosted on:</strong> Vercel</div>
          </div>

          <DonateSnippet />
        </footer>
      </body>
    </html>
  );
}