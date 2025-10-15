// app/layout.jsx
import './globals.css';
import { Inter } from 'next/font/google';
import Footer from './components/Footer';
import DonateBlock from './components/DonateBlock';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nomstead Open Marketplace',
  description: 'A sleek and minimalistic marketplace interface for Nomstead.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <header className="flex flex-col items-center py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold mb-4">Nomstead Open Marketplace</h1>
          <div className="mb-4">
            <DonateBlock />
          </div>
        </header>

        <main className="min-h-screen w-full max-w-5xl mx-auto p-4">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}