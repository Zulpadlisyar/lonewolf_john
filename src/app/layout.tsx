import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LoneWolf | High-Performance Sportswear & Athlete Community",
  description: "Engineered apparel for runners, lifters, and relentless athletes. Brand stories, community events, and technical gear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isStaging = process.env.APP_ENV === "staging";

  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
        {/* Staging Warning Banner */}
        {isStaging && (
          <div className="bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4 text-center tracking-wide uppercase">
            ⚠️ STAGING ENVIRONMENT — Test transactions only. Do not use real credit cards.
          </div>
        )}

        {/* Global Navigation */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-black text-xl tracking-tighter text-white hover:text-red-500 transition">
                LONEWOLF<span className="text-red-500">.</span>
              </Link>
              <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
                <Link href="/products" className="hover:text-white transition">Catalog</Link>
                <Link href="/stories" className="hover:text-white transition">Brand Stories</Link>
                <Link href="/community" className="hover:text-white transition">Community</Link>
                <Link href="/athletes" className="hover:text-white transition">Athletes</Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4 text-sm font-medium">
              <Link href="/cart" className="hover:text-white text-slate-300 transition flex items-center">
                Cart (0)
              </Link>
              <Link href="/account" className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded hover:bg-slate-800 transition">
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/60 py-12 text-sm text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white text-base mb-3">LONEWOLF APPAREL</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Performance apparel engineered in Indonesia. For solitary discipline and community strength.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs tracking-wider uppercase">Collections</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/products?cat=running" className="hover:text-white">Running Performance</Link></li>
                <li><Link href="/products?cat=training" className="hover:text-white">Training & Gym</Link></li>
                <li><Link href="/products?cat=lifestyle" className="hover:text-white">Athletes Streetwear</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs tracking-wider uppercase">Experience</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/stories" className="hover:text-white">Brand Manifesto</Link></li>
                <li><Link href="/athletes" className="hover:text-white">Sponsored Athletes</Link></li>
                <li><Link href="/community" className="hover:text-white">Midnight Run Crews</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs tracking-wider uppercase">Support & Policy</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/shipping-policy" className="hover:text-white">Shipping & Returns</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/api/health" className="text-slate-600 hover:text-slate-400">System Health</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} LoneWolf Sportswear. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Environment: {process.env.APP_ENV || "local"}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
