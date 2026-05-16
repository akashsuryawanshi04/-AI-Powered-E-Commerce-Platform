import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();   // don't navigate when clicking button
    addItem(product);
  };

  const imgError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/20"
    >
      {/* Product image */}
      <div className="relative h-48 bg-slate-700 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          onError={imgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.similarity_score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-cyan-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            <Zap size={10} />
            {(product.similarity_score * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category badge */}
        <span className="text-xs text-violet-400 font-medium uppercase tracking-wide truncate">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-sm text-white font-semibold line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <Star size={12} fill="currentColor" />
          <span>{product.rating ?? "4.2"}</span>
          <span className="text-slate-500">({product.reviews ?? 0})</span>
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-white">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
