import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Renovation Cost Calculator | Valencia Construction Chicago',
  description: 'Get an instant estimate for your home remodel project. Kitchen, bathroom, flooring, painting and full home renovations. Free quotes from Valencia Construction.',
  keywords: 'renovation calculator, remodel cost, Chicago contractor, kitchen remodel cost, bathroom remodel cost, Valencia Construction',
  openGraph: {
    title: 'How Much Does Your Remodel Cost? | Valencia Construction',
    description: 'Get an instant estimate for your Chicago home renovation. Free, no obligation.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">V</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Valencia Construction</h1>
                <p className="text-gold text-xs">Chicago&apos;s Trusted Builder</p>
              </div>
            </div>
            <a 
              href="tel:7736827788" 
              className="hidden sm:flex items-center gap-2 text-gold hover:text-gold-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="font-medium">(773) 682-7788</span>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                  <span className="text-black font-bold">V</span>
                </div>
                <span className="text-white font-semibold">Valencia Construction</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
                <a href="tel:7736827788" className="hover:text-gold transition-colors">
                  (773) 682-7788
                </a>
                <span className="hidden sm:inline">|</span>
                <a 
                  href="https://valenciaconstructionchi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  valenciaconstructionchi.com
                </a>
              </div>
              <p className="text-xs text-gray-500">
                © 2026 Valencia Construction. Licensed & Insured.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
