"""
scripts/generate_embeddings.py
──────────────────────────────────────────────────────────────────────────────
Generates sentence-transformer embeddings for every product description and
stores them in the MongoDB products collection as an 'embedding' field.

Run ONCE after load_data.py.  Safe to re-run — only updates missing ones.

Usage:
    python scripts/generate_embeddings.py

Model: all-MiniLM-L6-v2  (384-dim, fast, great quality)
"""

import os
import sys
import time
from tqdm import tqdm

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME   = os.getenv("DB_NAME",   "ai_ecommerce")
BATCH_SIZE = 64            # process 64 products at a time
MODEL_NAME = "all-MiniLM-L6-v2"


def main():
    print("╔══════════════════════════════════════════╗")
    print("║   Generating Product Embeddings          ║")
    print("╚══════════════════════════════════════════╝")

    # --- Connect to DB ---
    client = MongoClient(MONGO_URI)
    db     = client[DB_NAME]
    col    = db["products"]

    total = col.count_documents({})
    done  = col.count_documents({"embedding": {"$exists": True}})
    print(f"\n   Products total    : {total}")
    print(f"   Already embedded  : {done}")
    print(f"   Need embedding    : {total - done}")

    if total - done == 0:
        print("\n✅  All products already have embeddings!")
        return

    # --- Load model ---
    print(f"\n⏳  Loading model '{MODEL_NAME}'…")
    model = SentenceTransformer(MODEL_NAME)
    print("✅  Model ready.")

    # --- Process in batches ---
    cursor = col.find(
        {"embedding": {"$exists": False}},
        {"_id": 1, "name": 1, "description": 1, "category": 1}
    )
    docs  = list(cursor)
    start = time.time()

    for i in tqdm(range(0, len(docs), BATCH_SIZE), desc="  Embedding"):
        batch = docs[i : i + BATCH_SIZE]

        # Combine name + category + description for richer embeddings
        texts = [
            f"{d.get('name','')} {d.get('category','')} {d.get('description','')}"
            for d in batch
        ]

        # Encode batch → list of numpy arrays
        vectors = model.encode(texts, batch_size=BATCH_SIZE,
                               show_progress_bar=False,
                               convert_to_numpy=True)

        # Bulk update MongoDB
        from pymongo import UpdateOne
        ops = [
            UpdateOne(
                {"_id": doc["_id"]},
                {"$set": {"embedding": vec.tolist()}}
            )
            for doc, vec in zip(batch, vectors)
        ]
        col.bulk_write(ops, ordered=False)

    elapsed = time.time() - start
    print(f"\n✅  Embeddings complete in {elapsed:.1f}s")
    print(f"   Embedded {len(docs)} products")
    print(f"   Average : {elapsed/max(len(docs),1)*1000:.1f} ms/product")
    print("\nNext step → start the backend: python app.py")


if __name__ == "__main__":
    main()
