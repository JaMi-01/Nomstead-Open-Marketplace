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
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold text-center">Nomstead Open Marketplace</h1>
            <p className="text-center italic text-sm text-gray-600 mt-1">Version 3.6</p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="mt-4 mb-6">
            <DonateSnippet />
          </div>

          {children}
        </div>

        <footer className="max-w-6xl mx-auto px-4 mt-10 mb-10 text-center text-xs text-gray-500">
          <div>Nomstead Open Marketplace</div>
          <div className="mt-3 bg-white p-3 rounded-lg inline-block text-sm text-gray-600">
            <div><strong>Created by:</strong> ChatGPT</div>
            <div><strong>Vision by:</strong> <a className="text-blue-600 underline" href="https://x.com/jamionfire?s=21" target="_blank" rel="noreferrer">JaMi</a></div>
            <div><strong>Build on:</strong> <a className="text-blue-600 underline" href="https://github.com/JaMi-01/Nomstead-Open-Marketplace" target="_blank" rel="noreferrer">GitHub</a></div>
            <div><strong>Hosted on:</strong> Vercel</div>
          </div>
        </footer>
      </body>
    </html>
  );
}