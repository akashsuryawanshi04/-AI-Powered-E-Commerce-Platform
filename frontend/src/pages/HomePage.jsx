import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Search, Brain, ShoppingBag, BarChart2 } from "lucide-react";
import { getProducts, getCategories } from "../services/api";
import ProductGrid from "../components/product/ProductGrid";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [loading,          setLoading]           = useState(true);
  const [searchQuery,      setSearchQuery]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getProducts({ page: 1, limit: 10 }),
      getCategories(),
    ]).then(([pData, cData]) => {
      setFeaturedProducts(pData.products || []);
      setCategories((cData.categories || []).slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const features = [
    { icon: <Brain size={24} />, title: "Semantic Search",    desc: "AI-powered NLP search understands intent, not just keywords." },
    { icon: <Zap size={24} />,   title: "Smart Chatbot",      desc: "Ask ShopBot anything — get personalised recommendations instantly." },
    { icon: <BarChart2 size={24} />, title: "Basket Analysis", desc: "\"Frequently Bought Together\" powered by the Apriori algorithm." },
    { icon: <ShoppingBag size={24} />, title: "Real Products", desc: "Thousands of real Amazon products loaded from open datasets." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        {/* background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-slate-950 to-cyan-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-6">
            <Zap size={12} />
            AI-Powered E-Commerce Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Shop Smarter with
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Artificial Intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Semantic search, AI chatbot, and personalised recommendations — all in one place.
          </p>

          {/* Hero search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Try "wireless headphones" or "yoga mat"'
                className="w-full pl-9 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium text-sm transition">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-violet-700/50 transition">
              <div className="text-violet-400 mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-white mb-4">Browse Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 bg-slate-800 border border-slate-700 hover:border-violet-500 hover:text-violet-300 text-slate-300 text-sm rounded-full transition"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Featured Products</h2>
          <Link to="/products" className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm transition">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featuredProducts} loading={loading} />
      </section>
    </div>
  );
}
