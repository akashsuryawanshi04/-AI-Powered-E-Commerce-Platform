/**
 * context/CartContext.jsx
 * ──────────────────────────────────────────────────────────
 * Global cart state using React Context + useReducer.
 * Persisted to localStorage so the cart survives page refreshes.
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

// ── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i._id !== action.payload) };

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i._id !== id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === id ? { ...i, quantity } : i
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const stored = localStorage.getItem("cart");
  const initial = stored ? JSON.parse(stored) : { items: [] };

  const [state, dispatch] = useReducer(cartReducer, initial);

  // Sync cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const addItem     = (product)       => dispatch({ type: "ADD_ITEM",        payload: product });
  const removeItem  = (id)            => dispatch({ type: "REMOVE_ITEM",     payload: id });
  const updateQty   = (id, quantity)  => dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const clearCart   = ()              => dispatch({ type: "CLEAR_CART" });

  const totalItems  = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice  = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

/** Custom hook for easy consumption. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
