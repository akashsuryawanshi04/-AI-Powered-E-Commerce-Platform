import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CartItem({ item }) {
  const { removeItem, updateQty } = useCart();

  const imgError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80";
  };

  return (
    <div className="flex gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
      <img
        src={item.image_url}
        alt={item.name}
        onError={imgError}
        className="w-16 h-16 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">{item.category}</p>
        <p className="text-violet-400 font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => removeItem(item._id)}
          className="text-slate-500 hover:text-red-400 transition"
        >
          <Trash2 size={15} />
        </button>
        <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-2 py-1">
          <button onClick={() => updateQty(item._id, item.quantity - 1)} className="text-slate-300 hover:text-white transition">
            <Minus size={13} />
          </button>
          <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
          <button onClick={() => updateQty(item._id, item.quantity + 1)} className="text-slate-300 hover:text-white transition">
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
