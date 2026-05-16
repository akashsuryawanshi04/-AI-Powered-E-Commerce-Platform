import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Zap, Menu, X } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            NexaShop
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products with AI…"
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link to="/products" className="text-slate-300 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition">
            Products
          </Link>
          <Link to="/cart" className="relative flex items-center gap-1.5 text-sm px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-500 rounded-full text-xs flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-300 hover:text-white ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700 px-4 py-3 flex flex-col gap-2">
          <Link to="/products"  className="text-slate-300 py-2 text-sm" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/cart"      className="text-slate-300 py-2 text-sm" onClick={() => setMobileOpen(false)}>Cart ({totalItems})</Link>
        </div>
      )}
    </nav>
  );
}
