/**
 * services/api.js
 * ─────────────────────────────────────────────────────────
 * Centralised Axios client.
 * All API calls go through this file — easy to swap base URL.
 *
 * Usage:
 *   import api from './services/api';
 *   const { data } = await api.getProducts({ page: 1, category: 'Electronics' });
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Response interceptor: unwrap data or throw clean error ────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(msg));
  }
);


// ── Product endpoints ─────────────────────────────────────────────────────

/** Paginated product list. */
export const getProducts = ({ page = 1, limit = 20, category = "" } = {}) =>
  client.get("/products", { params: { page, limit, category } }).then((r) => r.data);

/** Single product by ID. */
export const getProductById = (id) =>
  client.get(`/products/${id}`).then((r) => r.data);

/** All category names. */
export const getCategories = () =>
  client.get("/categories").then((r) => r.data);


// ── Search endpoint ───────────────────────────────────────────────────────

/** Semantic search. */
export const searchProducts = (query, top_k = 12) =>
  client.post("/search", { query, top_k }).then((r) => r.data);


// ── Chat endpoint ─────────────────────────────────────────────────────────

/**
 * Send a chat turn.
 * messages: [{ role: 'user'|'assistant', content: string }]
 */
export const sendChatMessage = (messages, contextProducts = []) =>
  client.post("/chat", { messages, context_products: contextProducts }).then((r) => r.data);


// ── Recommendations endpoint ──────────────────────────────────────────────

/** Market-basket recommendations for a product. */
export const getRecommendations = (productId, n = 6) =>
  client.get(`/recommendations/${productId}`, { params: { n } }).then((r) => r.data);


// ── Health check ──────────────────────────────────────────────────────────
export const healthCheck = () =>
  client.get("/health").then((r) => r.data);

export default { getProducts, getProductById, getCategories,
                 searchProducts, sendChatMessage, getRecommendations, healthCheck };
