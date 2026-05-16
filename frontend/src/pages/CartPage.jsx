import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Trash2, CreditCard, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [checkedOut, setCheckedOut] = useState(false);

  const handleCheckout = () => {
    setCheckedOut(true);
    clearCart();
  };

  if (checkedOut) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-white px-4">
        <div className="w-20 h-20 bg-emerald-900/30 border border-emerald-700/40 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold">Order Placed!</h1>
        <p className="text-slate-400 text-center max-w-sm">
          Thank you for your purchase. This is a portfolio demo — no real transaction was made.
        </p>
        <Link to="/" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart size={22} className="text-violet-400" />
          <h1 className="text-2xl font-bold">Your Cart</h1>
          {totalItems > 0 && (
            <span className="text-sm bg-violet-900/40 border border-violet-700/40 text-violet-300 px-3 py-0.5 rounded-full">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-24 text-slate-400">
            <ShoppingCart size={56} strokeWidth={1} />
            <p className="text-lg">Your cart is empty</p>
            <Link to="/products" className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition">
              <ArrowLeft size={16} /> Start shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Item list */}
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}

            {/* Summary */}
            <div className="mt-4 bg-slate-900 border border-slate-700 rounded-xl p-5">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-4">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700 pt-3">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white font-semibold rounded-xl transition"
              >
                <CreditCard size={18} />
                Proceed to Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-sm text-red-400 hover:text-red-300 transition"
              >
                <Trash2 size={14} /> Clear cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
