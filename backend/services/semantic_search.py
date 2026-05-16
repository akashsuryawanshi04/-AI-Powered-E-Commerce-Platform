"""
services/semantic_search.py
──────────────────────────────────────────────────────────────────────────────
Semantic search using sentence-transformers (all-MiniLM-L6-v2).

How it works:
  1. During data loading  → each product description is encoded → stored as
     a float array in MongoDB under the "embedding" field.
  2. At query time        → user query is encoded → cosine similarity is
     computed against every stored embedding → top-K products are returned.

The model is loaded once at module import and reused for every request.
"""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId
import numpy as np
import os

# ── Load model once (slow first load, fast after) ────────────────────────────
print("⏳  Loading sentence-transformer model…")
MODEL = SentenceTransformer("all-MiniLM-L6-v2")
print("✅  Model loaded.")


def get_collection():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
    db     = client[os.getenv("DB_NAME", "ai_ecommerce")]
    return db["products"]


def embed_text(text: str) -> list:
    """Convert any text string into a 384-dim embedding vector."""
    vec = MODEL.encode(text, convert_to_numpy=True)
    return vec.tolist()


def semantic_search(query: str, top_k: int = 12) -> list:
    """
    Search products by semantic similarity.

    Steps:
      1. Encode the query.
      2. Pull all documents that have an 'embedding' field.
      3. Compute cosine similarity between query and each product embedding.
      4. Return top_k products sorted by similarity score.

    Returns a list of product dicts (embedding excluded, score included).
    """
    col         = get_collection()
    query_vec   = np.array(embed_text(query)).reshape(1, -1)

    # Fetch only _id + embedding (ignore description for bandwidth)
    cursor   = col.find({"embedding": {"$exists": True}}, {"embedding": 1})
    docs     = list(cursor)

    if not docs:
        return []

    # Build matrix of all product embeddings
    ids        = [str(d["_id"]) for d in docs]
    embeddings = np.array([d["embedding"] for d in docs])

    # Cosine similarity: shape (1, N) → flatten to (N,)
    scores  = cosine_similarity(query_vec, embeddings)[0]
    top_idx = np.argsort(scores)[::-1][:top_k]

    # Fetch full product documents for the top matches
    top_ids = [ObjectId(ids[i]) for i in top_idx]
    products_cursor = col.find(
        {"_id": {"$in": top_ids}},
        {"embedding": 0}          # exclude large vector from final response
    )

    # Map _id → score, then sort deterministically
    score_map = {ids[i]: float(scores[i]) for i in top_idx}
    results   = []
    for p in products_cursor:
        pid = str(p["_id"])
        p["_id"]           = pid
        p["similarity_score"] = round(score_map.get(pid, 0.0), 4)
        results.append(p)

    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results
