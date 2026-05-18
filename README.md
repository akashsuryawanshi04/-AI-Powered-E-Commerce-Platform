# 🛍️ NexaShop — AI-Powered E-Commerce Platform

> A full-stack, production-grade e-commerce application with **Semantic Search**, **AI Chatbot**, and **Market Basket Analysis** — built for your AI/ML + Full Stack Developer portfolio.

---

## 🎯 What This Project Demonstrates

| Skill | Technology |
|---|---|
| NLP / Semantic Search | `sentence-transformers` (all-MiniLM-L6-v2) |
| LLM Integration | OpenAI GPT-3.5 OR HuggingFace Mistral (FREE) |
| Market Basket Analysis | Apriori algorithm via `mlxtend` |
| REST API Design | Python Flask + Blueprint pattern |
| Frontend SPA | React 18 + React Router 6 |
| Styling | Tailwind CSS |
| Database | MongoDB (NoSQL) |
| Real Datasets | Amazon Products + Instacart Orders |

---

## 🗂️ Project Structure

```
ai-ecommerce/
├── backend/
│   ├── app.py                    # Flask factory, CORS, blueprints
│   ├── requirements.txt
│   ├── .env.example              # Copy to .env and fill in keys
│   ├── routes/
│   │   ├── products.py           # GET /products, /products/:id, /categories
│   │   ├── search.py             # POST /search  (semantic)
│   │   ├── chat.py               # POST /chat    (AI chatbot)
│   │   └── recommendations.py   # GET  /recommendations/:id (Apriori)
│   ├── models/
│   │   └── product.py            # MongoDB CRUD helpers
│   ├── services/
│   │   ├── semantic_search.py    # Embedding + cosine similarity
│   │   ├── chatbot.py            # OpenAI / HuggingFace wrapper
│   │   └── apriori_service.py    # Apriori rules + recommendations
│   ├── scripts/
│   │   ├── load_data.py          # Load CSVs → MongoDB
│   │   └── generate_embeddings.py # Embed descriptions → MongoDB
│   └── dataset/
│       ├── amazon_products.csv   # ← Download from Kaggle
│       └── instacart_orders.csv  # ← Download from Kaggle
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── index.js
        ├── index.css
        ├── context/
        │   └── CartContext.jsx   # Global cart state (localStorage)
        ├── services/
        │   └── api.js            # Axios client for all API calls
        ├── components/
        │   ├── common/Navbar.jsx
        │   ├── product/ProductCard.jsx
        │   ├── product/ProductGrid.jsx
        │   ├── cart/CartItem.jsx
        │   └── chat/ChatWidget.jsx  # Floating AI chatbot
        └── pages/
            ├── HomePage.jsx
            ├── ProductsPage.jsx
            ├── ProductDetailPage.jsx
            ├── SearchPage.jsx
            └── CartPage.jsx
```

---

## 📊 Dataset Setup (Required Before Running)

### 1. Amazon Products Dataset

1. Go to → **https://www.kaggle.com/datasets/lokeshparab/amazon-products-dataset**
2. Download the CSV
3. Rename it to `amazon_products.csv`
4. Place at: `backend/dataset/amazon_products.csv`

Expected columns (the loader auto-maps variants):

```
name/title/product_name, description/about_product, category/main_category,
price/actual_price/selling_price, image/image_url/img_link
```

### 2. Instacart Market Basket Dataset

1. Go to → **https://www.kaggle.com/datasets/psparks/instacart-market-basket-analysis**
2. Download `order_products__prior.csv`
3. Rename to `instacart_orders.csv`
4. Place at: `backend/dataset/instacart_orders.csv`

Expected columns: `order_id`, `product_id`

---

## ⚙️ Backend Setup

### Prerequisites

- Python 3.10+
- MongoDB running locally (or MongoDB Atlas URI)
- `pip`

### Steps

```bash
# 1. Navigate to backend
cd ai-ecommerce/backend

# 2. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your values (see below)
```

### Environment Variables (`.env`)

```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=ai_ecommerce

# Choose your LLM provider:
LLM_PROVIDER=huggingface      # FREE — uses HuggingFace Inference API

# Get a free HuggingFace token at https://huggingface.co/settings/tokens
HF_API_KEY=hf_xxxxxxxxxxxx

# OR use OpenAI (paid after free credits)
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

### Load Data into MongoDB

```bash
# Step 1: Load CSVs into MongoDB (run from backend/ folder)
python scripts/load_data.py

# Step 2: Generate semantic embeddings (takes 5-15 min depending on dataset size)
python scripts/generate_embeddings.py
```

### Start the Backend Server

```bash
python app.py
# API available at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

## 🎨 Frontend Setup

### Prerequisites

- Node.js 18+
- npm

### Steps

```bash
# 1. Navigate to frontend
cd ai-ecommerce/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# App available at http://localhost:3000
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products` | Paginated products (`?page=1&limit=20&category=Electronics`) |
| `GET` | `/api/products/:id` | Single product by ID |
| `GET` | `/api/categories` | All category names |
| `POST` | `/api/search` | Semantic search `{ "query": "...", "top_k": 12 }` |
| `POST` | `/api/chat` | AI chatbot `{ "messages": [...] }` |
| `GET` | `/api/recommendations/:id` | "Frequently Bought Together" (`?n=6`) |

### Example: Semantic Search

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "wireless noise cancelling headphones", "top_k": 8}'
```

### Example: Chat

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "What are the best electronics under $50?"}]}'
```

---

## 🧠 How the AI Features Work

### Semantic Search

1. On data load, every product's `name + category + description` is encoded into a **384-dimensional vector** using `sentence-transformers/all-MiniLM-L6-v2`.
2. Vectors are stored in MongoDB as an `embedding` field.
3. At search time, the user query is encoded to a vector.
4. **Cosine similarity** is computed between the query vector and all product vectors.
5. Top-K most similar products are returned — even if exact keywords don't match.

### AI Chatbot

- Uses **HuggingFace Inference API** (free tier) with `Mistral-7B-Instruct-v0.2`.
- The entire conversation history is sent with each request → **context-aware** multi-turn chat.
- Optional product context can be injected to ground responses.

### Market Basket Analysis (Apriori)

1. Instacart transaction data (order_id, product_id pairs) is loaded.
2. Orders are converted to a **one-hot encoded basket matrix**.
3. The **Apriori algorithm** finds frequent itemsets (`min_support=0.01`).
4. **Association rules** are generated (`min_lift=1.2`, `min_confidence=0.2`).
5. Rules are **cached in memory** — only computed once per server start.
6. Given a product ID, antecedent-matching rules return the top recommended consequents.

---

## 🚀 Deployment (Optional)

### Backend → Render / Railway / Fly.io

```bash
# Add to Procfile:
web: gunicorn app:create_app()

# Set environment variables in the platform dashboard
```

### Frontend → Vercel / Netlify

```bash
npm run build
# Upload the build/ folder
# Set REACT_APP_API_URL=https://your-backend-url.com/api
```

### MongoDB → MongoDB Atlas (Free Tier)

1. Create a free cluster at https://mongodb.com/atlas
2. Copy the connection string
3. Set `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/` in `.env`

---

## 📤 GitHub Upload Guide

```bash
# 1. Initialise git (inside the ai-ecommerce/ root)
git init
git add .
git commit -m "feat: initial AI e-commerce platform"

# 2. Create a repo on GitHub (https://github.com/new)
#    Name: ai-ecommerce-platform

# 3. Push
git remote add origin https://github.com/YOUR_USERNAME/ai-ecommerce-platform.git
git branch -M main
git push -u origin main
```

### Suggested GitHub Repository Description

> Full-stack AI-powered e-commerce platform with NLP semantic search (sentence-transformers), LLM chatbot (Mistral/GPT), and Market Basket Analysis (Apriori). Built with React, Flask, and MongoDB using real Amazon and Instacart datasets.

### Suggested Topics / Tags

`python` `flask` `react` `mongodb` `nlp` `machine-learning` `semantic-search` `recommendation-system` `apriori` `sentence-transformers` `tailwindcss` `ecommerce` `portfolio`

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` inside `venv` |
| MongoDB connection error | Ensure `mongod` is running: `sudo systemctl start mongod` |
| No products showing | Run `load_data.py` then `generate_embeddings.py` |
| HuggingFace 503 error | Model is cold-starting, retry after 20s or upgrade to a smaller model |
| CORS error in browser | Ensure backend `FLASK_PORT=5000` and frontend proxy is set in `package.json` |
| Embedding takes too long | Reduce the dataset (head 5000 rows) or use GPU |


---

# 👨‍💻 Author

## Akash Suryawanshi

MCA Student | AI/ML Developer | Full Stack Developer

---

## 📄 License

MIT — free to use, modify, and include in your portfolio.

---

*Built as a portfolio project demonstrating full-stack AI engineering. No real transactions are processed.*
"# -AI-Powered-E-Commerce-Platform" 

