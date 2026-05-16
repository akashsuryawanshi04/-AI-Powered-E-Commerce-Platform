"""
routes/products.py  –  Product CRUD endpoints
  GET /api/products            → paginated list (optional ?category=&page=&limit=)
  GET /api/products/<id>       → single product
  GET /api/categories          → list of all category names
"""

from flask import Blueprint, request, jsonify
from models.product import get_all_products, get_product_by_id, get_categories

products_bp = Blueprint("products", __name__)


@products_bp.route("/products", methods=["GET"])
def list_products():
    """
    Paginated product list.
    Query params:
      page     (int, default 1)
      limit    (int, default 20)
      category (str, optional)
    """
    try:
        page     = int(request.args.get("page",     1))
        limit    = int(request.args.get("limit",    20))
        category = request.args.get("category", None)

        # Clamp page and limit to sane ranges
        page  = max(1, page)
        limit = min(max(1, limit), 100)

        products, total = get_all_products(page=page, limit=limit, category=category)

        return jsonify({
            "success":     True,
            "products":    products,
            "total":       total,
            "page":        page,
            "limit":       limit,
            "total_pages": (total + limit - 1) // limit,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@products_bp.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    """Fetch a single product by its MongoDB _id."""
    try:
        product = get_product_by_id(product_id)
        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404
        return jsonify({"success": True, "product": product})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@products_bp.route("/categories", methods=["GET"])
def list_categories():
    """Return a sorted list of all category names."""
    try:
        cats = get_categories()
        return jsonify({"success": True, "categories": cats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
