import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border border-slate-800 p-8 sm:p-16 lg:p-20 shadow-2xl">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              New Season 2026/2027
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              BUILT FOR SILENCE. <br />
              <span className="text-red-500">ENGINEERED FOR GRIT.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Technical running apparel, compression gear, and post-training streetwear designed in Indonesia for athletes who embrace the solitary grind.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-red-600/30"
              >
                Shop Collection
              </Link>
              <Link
                href="/stories"
                className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm tracking-wide transition"
              >
                Read Manifesto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Collections</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">DISCIPLINE BY DESIGN</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-slate-400 hover:text-white transition">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-80 flex flex-col justify-end p-6 hover:border-slate-700 transition">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
            <div className="relative z-20 space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">Running Performance</h3>
              <p className="text-xs text-slate-400">Ultralight singlets, split shorts & windbreakers.</p>
              <Link href="/products?cat=running" className="inline-block text-xs font-semibold text-white underline pt-1">
                Explore Gear
              </Link>
            </div>
          </div>

          <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-80 flex flex-col justify-end p-6 hover:border-slate-700 transition">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
            <div className="relative z-20 space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">Training & Gym</h3>
              <p className="text-xs text-slate-400">2-in-1 compression shorts, grip tees & knee sleeves.</p>
              <Link href="/products?cat=training" className="inline-block text-xs font-semibold text-white underline pt-1">
                Explore Gear
              </Link>
            </div>
          </div>

          <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-80 flex flex-col justify-end p-6 hover:border-slate-700 transition">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
            <div className="relative z-20 space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">Athletes Lifestyle</h3>
              <p className="text-xs text-slate-400">Heavyweight 480 GSM hoodies & technical joggers.</p>
              <Link href="/products?cat=lifestyle" className="inline-block text-xs font-semibold text-white underline pt-1">
                Explore Gear
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Experience & Community Highlights */}
      <section className="bg-slate-900/60 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Experience</p>
            <h2 className="text-3xl font-black text-white">MORE THAN APPAREL</h2>
            <p className="text-sm text-slate-400">
              Explore the athletes pushing human limits and the local running crews meeting at midnight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="border border-slate-800 rounded-xl p-6 bg-slate-950 hover:border-slate-700 transition space-y-3">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Brand Story</span>
              <h3 className="text-lg font-bold text-white">The Lone Wolf Manifesto</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Why we run in the rain, embrace solitary training, and value discipline over fleeting motivation.
              </p>
              <Link href="/stories" className="text-xs font-semibold text-slate-300 hover:text-white inline-block pt-2">
                Read Story &rarr;
              </Link>
            </article>

            <article className="border border-slate-800 rounded-xl p-6 bg-slate-950 hover:border-slate-700 transition space-y-3">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Athlete Spotlight</span>
              <h3 className="text-lg font-bold text-white">Diana Kusuma: Road to 42K</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                How our sponsored triathlete Diana tests our Apex micro-mesh gear in high-humidity tropical marathons.
              </p>
              <Link href="/athletes" className="text-xs font-semibold text-slate-300 hover:text-white inline-block pt-2">
                Meet Diana &rarr;
              </Link>
            </article>

            <article className="border border-slate-800 rounded-xl p-6 bg-slate-950 hover:border-slate-700 transition space-y-3">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Community</span>
              <h3 className="text-lg font-bold text-white">Jakarta Midnight Crew Vol. 04</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Weekly Thursday 9 PM night run at GBK. 5K and 10K pacers, hydration stations, and gear trials.
              </p>
              <Link href="/community" className="text-xs font-semibold text-slate-300 hover:text-white inline-block pt-2">
                Join Next Run &rarr;
              </Link>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

