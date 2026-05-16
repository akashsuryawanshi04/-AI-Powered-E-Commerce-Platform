import React from "react";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

export default function ProductGrid({ products, loading, emptyMessage = "No products found." }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-violet-500" />
        <p className="text-sm">Loading products…</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <div className="text-5xl">🔍</div>
        <p className="text-base font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
