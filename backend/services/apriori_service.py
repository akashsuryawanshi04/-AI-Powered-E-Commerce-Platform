"""
services/apriori_service.py
──────────────────────────────────────────────────────────────────────────────
Market Basket Analysis using the Apriori algorithm (mlxtend).

How it works:
  1. Instacart order-product data is loaded from MongoDB.
  2. Transactions are converted to a one-hot encoded DataFrame.
  3. Apriori finds frequent itemsets above min_support threshold.
  4. Association rules are generated with min_confidence and min_lift.
  5. Given a product ID, we return the top associated products.

Rules are CACHED after first computation so subsequent calls are instant.
"""

import os
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from pymongo import MongoClient

# Cache so Apriori runs only once per server lifetime
_rules_cache = None


def _get_db():
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
    return client[os.getenv("DB_NAME", "ai_ecommerce")]


def _load_rules():
    """Load Instacart transactions from MongoDB and run Apriori."""
    global _rules_cache
    if _rules_cache is not None:
        return _rules_cache

    print("⏳  Running Apriori algorithm…")
    db      = _get_db()
    col     = db["transactions"]

    # Each document: { order_id, product_id }
    docs    = list(col.find({}, {"_id": 0, "order_id": 1, "product_id": 1}))
    if not docs:
        print("⚠️  No transaction data found — skipping Apriori.")
        _rules_cache = pd.DataFrame()
        return _rules_cache

    df = pd.DataFrame(docs)

    # Build basket: rows = orders, columns = products, values = 1/0
    basket = (
        df.groupby(["order_id", "product_id"])["product_id"]
        .count()
        .unstack(fill_value=0)
    )
    basket = basket.applymap(lambda x: 1 if x > 0 else 0)

    # Run Apriori — low support because retail data is sparse
    frequent_itemsets = apriori(
        basket,
        min_support=0.01,
        use_colnames=True,
        max_len=3
    )

    if frequent_itemsets.empty:
        _rules_cache = pd.DataFrame()
        return _rules_cache

    rules = association_rules(
        frequent_itemsets,
        metric="lift",
        min_threshold=1.2
    )
    rules = rules[rules["confidence"] >= 0.2]
    rules = rules.sort_values("lift", ascending=False)

    print(f"✅  Apriori complete — {len(rules)} rules generated.")
    _rules_cache = rules
    return rules


def get_recommendations(product_id: str, top_n: int = 6) -> list:
    """
    Given a product_id (string matching transaction data),
    return up to top_n associated product IDs.
    """
    rules = _load_rules()
    if rules.empty:
        return []

    # Look for rules where the antecedent contains this product
    matches = rules[rules["antecedents"].apply(lambda s: product_id in s)]
    if matches.empty:
        return []

    recommended = []
    for _, row in matches.head(top_n).iterrows():
        for pid in row["consequents"]:
            if pid != product_id and pid not in recommended:
                recommended.append(pid)

    return recommended[:top_n]
