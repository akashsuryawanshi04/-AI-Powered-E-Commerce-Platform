"""
models/product.py  –  MongoDB helper functions for the products collection.

Every function here wraps a MongoDB operation.
Embeddings (large float arrays) are excluded from responses by default.
"""

from pymongo import MongoClient, ASCENDING, TEXT
from bson    import ObjectId
import os


def _get_col():
    """Return the MongoDB products collection."""
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
    db     = client[os.getenv("DB_NAME", "ai_ecommerce")]
    return db["products"]


# ── CRUD helpers ──────────────────────────────────────────────────────────────

def get_all_products(page=1, limit=20, category=None):
    """Paginated product list, optional category filter."""
    col   = _get_col()
    query = {}
    if category and category.lower() != "all":
        query["category"] = {"$regex": category, "$options": "i"}

    skip     = (page - 1) * limit
    cursor   = col.find(query, {"embedding": 0}).skip(skip).limit(limit)
    total    = col.count_documents(query)
    products = [_serialize(p) for p in cursor]
    return products, total


def get_product_by_id(product_id: str):
    """Fetch one product by its MongoDB ObjectId string."""
    col = _get_col()
    try:
        p = col.find_one({"_id": ObjectId(product_id)}, {"embedding": 0})
        return _serialize(p) if p else None
    except Exception:
        return None


def get_products_by_ids(product_ids: list):
    """Fetch many products by a list of ObjectId strings."""
    col = _get_col()
    oids = []
    for pid in product_ids:
        try:
            oids.append(ObjectId(pid))
        except Exception:
            pass
    if not oids:
        return []
    return [_serialize(p) for p in col.find({"_id": {"$in": oids}}, {"embedding": 0})]


def get_categories():
    """Distinct category names."""
    col = _get_col()
    return sorted([c for c in col.distinct("category") if c and isinstance(c, str)])


def ensure_indexes():
    """Create indexes for fast queries. Call once at startup."""
    col = _get_col()
    col.create_index([("category", ASCENDING)])
    col.create_index([("name", TEXT), ("description", TEXT)])
    print("✅  MongoDB indexes ready.")


# ── Private helpers ───────────────────────────────────────────────────────────

def _serialize(doc):
    """Convert MongoDB _id ObjectId → plain string."""
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc
