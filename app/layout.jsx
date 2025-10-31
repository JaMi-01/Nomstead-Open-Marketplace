import './globals.css';
import DonateSnippet from './components/DonateSnippet';
import FooterInfo from './components/FooterInfo';

export const metadata = {
  title: 'Nomstead Open Marketplace',
  description: 'Nomstead marketplace viewer — Buy, Sell, Profit'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fdf6e3] text-gray-800">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center">
            <h1 className="text-3xl font-extrabold">Nomstead Open Marketplace</h1>
            <p className="text-sm italic text-gray-600 mt-1">Version 4</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 mt-6">
          <DonateSnippet />
          {children}
        </main>

        <footer className="max-w-6xl mx-auto px-4 mt-10 mb-10">
          <FooterInfo />
        </footer>
      </body>
    </html>
  );
}