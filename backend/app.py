"""
AI-Powered E-Commerce Backend  –  app.py
Flask application factory with CORS, blueprints & error handlers.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from routes.products import products_bp
from routes.search   import search_bp
from routes.chat     import chat_bp
from routes.recommendations import recommendations_bp


def create_app():
    app = Flask(__name__)

    # Allow React dev server at :3000 to call this API
    CORS(app, resources={r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Register all route blueprints under /api
    app.register_blueprint(products_bp,       url_prefix="/api")
    app.register_blueprint(search_bp,         url_prefix="/api")
    app.register_blueprint(chat_bp,           url_prefix="/api")
    app.register_blueprint(recommendations_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "healthy", "version": "1.0.0"})

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    return app


if __name__ == "__main__":
    app  = create_app()
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f"🚀  AI E-Commerce API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
