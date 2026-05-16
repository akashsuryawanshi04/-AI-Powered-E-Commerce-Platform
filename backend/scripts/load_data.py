"""
scripts/load_data.py
──────────────────────────────────────────────────────────────────────────────
Loads Amazon product CSV and Instacart order CSV into MongoDB.

Usage:
    python scripts/load_data.py

Dataset sources (download before running):
  Amazon Products:
    https://www.kaggle.com/datasets/lokeshparab/amazon-products-dataset
    → save as backend/dataset/amazon_products.csv

  Instacart Orders:
    https://www.kaggle.com/c/instacart-market-basket-analysis/data
    → save order_products__prior.csv as backend/dataset/instacart_orders.csv

The script is idempotent — re-running it first clears and reloads the data.
"""

import os
import sys
import pandas as pd
from pymongo import MongoClient
from tqdm import tqdm
import random

# ── Allow imports from the backend root ──────────────────────────────────────
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

MONGO_URI  = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME    = os.getenv("DB_NAME",   "ai_ecommerce")

AMAZON_CSV     = os.path.join(os.path.dirname(__file__), "../dataset/amazon_products.csv")
INSTACART_CSV  = os.path.join(os.path.dirname(__file__), "../dataset/instacart_orders.csv")

# Placeholder image buckets by category keyword
PLACEHOLDER_IMAGES = {
    "electronics": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
    "clothing":    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    "books":       "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    "kitchen":     "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
    "sports":      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400",
    "toys":        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400",
    "beauty":      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    "default":     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
}


def get_image_url(category: str) -> str:
    """Pick a relevant placeholder image URL for a category."""
    cat = str(category).lower()
    for key in PLACEHOLDER_IMAGES:
        if key in cat:
            return PLACEHOLDER_IMAGES[key]
    return PLACEHOLDER_IMAGES["default"]


def load_amazon_products(db):
    """Load Amazon products CSV into the 'products' collection."""
    print("\n📦  Loading Amazon products…")

    if not os.path.exists(AMAZON_CSV):
        print(f"⚠️   File not found: {AMAZON_CSV}")
        print("     Download from Kaggle and place at dataset/amazon_products.csv")
        return

    df = pd.read_csv(AMAZON_CSV, encoding="utf-8", on_bad_lines="skip")
    print(f"   Raw rows: {len(df)}")

    # Normalise column names to lowercase + strip whitespace
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Map possible column name variants
    rename_map = {
        "product_name": "name",
        "title":        "name",
        "product_title": "name",
        "actual_price": "price",
        "selling_price": "price",
        "discounted_price": "price",
        "main_category": "category",
        "sub_category":  "subcategory",
        "about_product": "description",
        "product_description": "description",
        "image": "image_url",
        "img_link": "image_url",
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    # Keep only rows with a name
    required_cols = ["name"]
    df.dropna(subset=[c for c in required_cols if c in df.columns], inplace=True)

    # --- Price: clean to float ---
    if "price" in df.columns:
        df["price"] = (
            df["price"]
            .astype(str)
            .str.replace(r"[₹$,€£\s]", "", regex=True)
            .str.replace(r"[^\d.]", "", regex=True)
        )
        df["price"] = pd.to_numeric(df["price"], errors="coerce")
    else:
        df["price"] = None

    # Fill missing prices with a random plausible value
    df["price"] = df["price"].apply(
        lambda p: round(p, 2) if pd.notna(p) and p > 0
        else round(random.uniform(9.99, 299.99), 2)
    )

    # --- Image URL ---
    if "image_url" not in df.columns:
        df["image_url"] = df.get("category", pd.Series(["default"] * len(df))).apply(get_image_url)
    else:
        df["image_url"] = df["image_url"].fillna("")
        df["image_url"] = df.apply(
            lambda r: r["image_url"] if r["image_url"] else get_image_url(r.get("category", "")),
            axis=1
        )

    # --- Description fallback ---
    if "description" not in df.columns:
        df["description"] = df["name"]

    df["description"] = df["description"].fillna(df["name"])

    # --- Category ---
    if "category" not in df.columns:
        df["category"] = "General"
    df["category"] = df["category"].fillna("General")

    # Build document list
    products = []
    for _, row in df.iterrows():
        products.append({
            "name":        str(row.get("name",        ""))[:200],
            "description": str(row.get("description", ""))[:1000],
            "category":    str(row.get("category",    "General")),
            "subcategory": str(row.get("subcategory", "")),
            "price":       float(row.get("price",     9.99)),
            "image_url":   str(row.get("image_url",   get_image_url(""))),
            "rating":      round(random.uniform(3.5, 5.0), 1),
            "reviews":     random.randint(10, 5000),
            "in_stock":    True,
        })

    col = db["products"]
    col.drop()                              # clear old data
    col.insert_many(products, ordered=False)
    print(f"   ✅  Inserted {len(products)} products.")


def load_instacart_orders(db):
    """Load Instacart order-product CSV into the 'transactions' collection."""
    print("\n🛒  Loading Instacart transactions…")

    if not os.path.exists(INSTACART_CSV):
        print(f"⚠️   File not found: {INSTACART_CSV}")
        print("     Download from Kaggle and place at dataset/instacart_orders.csv")
        return

    df = pd.read_csv(INSTACART_CSV, usecols=["order_id", "product_id"])
    df.dropna(inplace=True)
    df["order_id"]   = df["order_id"].astype(str)
    df["product_id"] = df["product_id"].astype(str)

    # Limit to first 100k rows for performance in dev
    MAX_ROWS = 100_000
    if len(df) > MAX_ROWS:
        print(f"   Truncating to {MAX_ROWS} rows for performance…")
        df = df.head(MAX_ROWS)

    records = df.to_dict("records")
    col = db["transactions"]
    col.drop()
    batch_size = 5_000
    for i in tqdm(range(0, len(records), batch_size), desc="  Inserting"):
        col.insert_many(records[i:i+batch_size], ordered=False)

    print(f"   ✅  Inserted {len(records)} transaction rows.")


def main():
    print("╔══════════════════════════════════════════╗")
    print("║   AI E-Commerce  –  Data Loader          ║")
    print("╚══════════════════════════════════════════╝")

    client = MongoClient(MONGO_URI)
    db     = client[DB_NAME]

    load_amazon_products(db)
    load_instacart_orders(db)

    # Create indexes for fast queries
    db["products"].create_index([("category", 1)])
    db["transactions"].create_index([("order_id", 1)])
    db["transactions"].create_index([("product_id", 1)])

    print("\n✅  All data loaded successfully!")
    print(f"   Database : {DB_NAME}")
    print(f"   Products : {db['products'].count_documents({})}")
    print(f"   Orders   : {db['transactions'].count_documents({})}")
    print("\nNext step → run: python scripts/generate_embeddings.py")


if __name__ == "__main__":
    main()
