"""
routes/chat.py  –  AI Chatbot endpoint
  POST /api/chat
  body: {
    "messages": [{"role": "user", "content": "..."}],
    "context_products": [...]   // optional product list for grounding
  }
"""

from flask import Blueprint, request, jsonify
from services.chatbot import chat

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chatbot():
    """
    Context-aware chatbot endpoint.
    Accepts full conversation history so the model can reference prior turns.
    """
    try:
        body             = request.get_json(force=True) or {}
        messages         = body.get("messages", [])
        context_products = body.get("context_products", [])

        if not messages:
            return jsonify({"success": False, "error": "messages cannot be empty"}), 400

        # Validate message format
        for m in messages:
            if "role" not in m or "content" not in m:
                return jsonify({"success": False,
                                "error": "Each message needs 'role' and 'content'"}), 400

        reply = chat(messages, context_products=context_products)
        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
