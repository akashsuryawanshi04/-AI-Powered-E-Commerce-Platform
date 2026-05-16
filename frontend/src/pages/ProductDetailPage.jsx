import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, Package, Loader2, Zap } from "lucide-react";
import { getProductById, getRecommendations } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/product/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct]             = useState(null);
  const [recommendations, setRecs]        = useState([]);
  const [loading, setLoading]             = useState(true);
  const [addedMessage, setAddedMessage]   = useState("");

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((d) => {
        setProduct(d.product);
        // Fetch basket-analysis recommendations
        return getRecommendations(id);
      })
      .then((d) => setRecs(d.recommendations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addItem(product);
    setAddedMessage("Added to cart!");
    setTimeout(() => setAddedMessage(""), 2500);
  };

  const imgError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Package size={48} />
        <p>Product not found.</p>
        <Link to="/products" className="text-violet-400 underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link to="/products" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition">
          <ArrowLeft size={14} /> Back to products
        </Link>

        {/* Main product section */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden aspect-square">
            <img
              src={product.image_url}
              alt={product.name}
              onError={imgError}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <span className="text-violet-400 text-sm font-medium uppercase tracking-wide">
              {product.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 text-amber-400 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(product.rating ?? 4) ? "currentColor" : "none"} />
              ))}
              <span className="text-slate-400 ml-1">({product.reviews ?? 0} reviews)</span>
            </div>

            <div className="text-4xl font-extrabold text-white">
              ${parseFloat(product.price).toFixed(2)}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Package size={14} />
              {product.in_stock ? "In Stock — Ready to ship" : "Out of Stock"}
            </div>

            {/* Add to cart */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleAdd}
                disabled={!product.in_stock}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              {addedMessage && (
                <p className="text-center text-emerald-400 text-sm font-medium">{addedMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-cyan-400" />
              <h2 className="text-xl font-bold">Frequently Bought Together</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.slice(0, 6).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
