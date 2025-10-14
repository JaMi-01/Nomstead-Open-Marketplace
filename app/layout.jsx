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
      <body className="bg-gradient-to-b from-white to-[#fdf6e3] min-h-screen text-gray-800">
        <header className="bg-white shadow-sm py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold">Nomstead Open Marketplace</h1>
            <p className="text-sm italic text-gray-600 mt-1">Version 3.9</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 mt-6">
          {/* Donate block under main title — DonateSnippet is a client component */}
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