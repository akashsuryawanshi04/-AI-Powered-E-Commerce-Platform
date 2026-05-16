import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Zap, Loader2 } from "lucide-react";
import { searchProducts } from "../services/api";
import ProductGrid from "../components/product/ProductGrid";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawQuery = searchParams.get("q") || "";

  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [inputQuery, setInputQuery] = useState(rawQuery);
  const [searched,   setSearched]   = useState(false);

  useEffect(() => {
    if (!rawQuery) return;
    setInputQuery(rawQuery);
    setLoading(true);
    setSearched(false);
    searchProducts(rawQuery, 24)
      .then((d) => setResults(d.products || []))
      .catch(console.error)
      .finally(() => { setLoading(false); setSearched(true); });
  }, [rawQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) navigate(`/search?q=${encodeURIComponent(inputQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          <button type="submit" className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition">
            Search
          </button>
        </form>

        {/* Results header */}
        {searched && !loading && (
          <div className="flex items-center gap-2 mb-6 text-slate-400 text-sm">
            <Zap size={14} className="text-cyan-400" />
            Semantic search found
            <span className="text-white font-semibold">{results.length}</span>
            results for
            <span className="text-violet-300 font-medium">"{rawQuery}"</span>
          </div>
        )}

        <ProductGrid
          products={results}
          loading={loading}
          emptyMessage={searched ? `No results found for "${rawQuery}"` : "Enter a search query above"}
        />
      </div>
    </div>
  );
}
