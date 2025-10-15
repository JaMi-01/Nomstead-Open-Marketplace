import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata = {
  title: 'Nomstead Open Marketplace',
  description: 'Buy/Sell marketplace for Nomstead - Open Marketplace'
}

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
