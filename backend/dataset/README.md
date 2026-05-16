# Dataset Folder

Place your downloaded datasets here:

1. `amazon_products.csv`  → from https://www.kaggle.com/datasets/lokeshparab/amazon-products-dataset
2. `instacart_orders.csv` → from https://www.kaggle.com/c/instacart-market-basket-analysis/data
                              (rename order_products__prior.csv → instacart_orders.csv)

These files are excluded from git via .gitignore due to their large size.
After placing the files, run:
  python scripts/load_data.py
  python scripts/generate_embeddings.py
