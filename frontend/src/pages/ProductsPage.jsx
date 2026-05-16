import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, getCategories } from "../services/api";
import ProductGrid from "../components/product/ProductGrid";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get("category") || "";
  const page     = parseInt(searchParams.get("page") || "1", 10);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page, limit: 20, category });
      setProducts(data.products || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    getCategories().then((d) => setCategories(["All", ...(d.categories || [])]));
  }, []);

  const setCategory = (cat) => {
    setSearchParams(cat && cat !== "All" ? { category: cat, page: 1 } : { page: 1 });
  };
  const setPage = (p) => {
    const params = { page: p };
    if (category) params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Filter size={20} className="text-violet-400" />
          <h1 className="text-2xl font-bold">All Products</h1>
          {category && (
            <span className="text-sm bg-violet-900/40 border border-violet-700/40 text-violet-300 px-3 py-0.5 rounded-full">
              {category}
            </span>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.slice(0, 15).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 text-sm rounded-full border transition ${
                (category === cat) || (!category && cat === "All")
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <ProductGrid products={products} loading={loading} />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:border-violet-500 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-400 text-sm">
              Page <span className="text-white font-semibold">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="w-9 h-9 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:border-violet-500 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
