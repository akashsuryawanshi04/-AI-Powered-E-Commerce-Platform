import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar     from "./components/common/Navbar";
import ChatWidget from "./components/chat/ChatWidget";
import HomePage          from "./pages/HomePage";
import ProductsPage      from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage        from "./pages/SearchPage";
import CartPage          from "./pages/CartPage";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-slate-950">
          <Navbar />
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/products"      element={<ProductsPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
            <Route path="/search"        element={<SearchPage />} />
            <Route path="/cart"          element={<CartPage />} />
          </Routes>
          {/* Floating AI chatbot — visible on every page */}
          <ChatWidget />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
