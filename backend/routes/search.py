"""
routes/search.py  –  Semantic search endpoint
  POST /api/search  body: { "query": "...", "top_k": 12 }
"""

from flask import Blueprint, request, jsonify
from services.semantic_search import semantic_search

search_bp = Blueprint("search", __name__)


@search_bp.route("/search", methods=["POST"])
def search():
    """
    Semantic product search.
    Accepts JSON body: { "query": "waterproof hiking boots", "top_k": 10 }
    Returns products ranked by cosine similarity to the query.
    """
    try:
        body  = request.get_json(force=True) or {}
        query = body.get("query", "").strip()

        if not query:
            return jsonify({"success": False, "error": "Query cannot be empty"}), 400

        top_k    = min(int(body.get("top_k", 12)), 50)   # cap at 50
        results  = semantic_search(query, top_k=top_k)

        return jsonify({
            "success":  True,
            "query":    query,
            "count":    len(results),
            "products": results,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
