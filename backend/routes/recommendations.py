"""
routes/recommendations.py
  GET /api/recommendations/<product_id>
      → "Frequently Bought Together" via Apriori association rules.
      → Falls back to category-based similar products.
"""

from flask import Blueprint, request, jsonify
from services.apriori_service import get_recommendations
from models.product import get_products_by_ids, get_all_products, get_product_by_id

recommendations_bp = Blueprint("recommendations", __name__)


@recommendations_bp.route("/recommendations/<product_id>", methods=["GET"])
def recommend(product_id):
    """
    Returns recommended products for a given product_id.
    First tries Apriori (basket analysis), then falls back to same category.
    """
    try:
        top_n = int(request.args.get("n", 6))

        # --- 1. Apriori-based recommendations ---
        rec_ids = get_recommendations(product_id, top_n=top_n)
        products = get_products_by_ids(rec_ids) if rec_ids else []

        # --- 2. Fallback: same category products ---
        if len(products) < top_n:
            source_product = get_product_by_id(product_id)
            if source_product:
                category = source_product.get("category", "")
                fallback, _ = get_all_products(page=1, limit=top_n + 5, category=category)
                # Exclude the product itself and already-found recommendations
                existing_ids = {p["_id"] for p in products}
                existing_ids.add(product_id)
                for p in fallback:
                    if p["_id"] not in existing_ids and len(products) < top_n:
                        products.append(p)
                        existing_ids.add(p["_id"])

        return jsonify({
            "success":  True,
            "product_id": product_id,
            "count":    len(products),
            "recommendations": products,
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
