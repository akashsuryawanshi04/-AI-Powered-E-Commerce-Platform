"""
services/chatbot.py
──────────────────────────────────────────────────────────────────────────────
AI chatbot that answers product queries.

Supports TWO backends — configure via LLM_PROVIDER env variable:
  "openai"       → GPT-3.5-turbo via OpenAI API
  "huggingface"  → Mistral-7B-Instruct via HuggingFace Inference API (FREE)

The chatbot receives conversation history so it is context-aware across
multiple turns.
"""

import os
import requests
import json

LLM_PROVIDER   = os.getenv("LLM_PROVIDER", "huggingface")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
HF_API_KEY     = os.getenv("HF_API_KEY", "")

# HuggingFace endpoint for Mistral (free tier inference API)
HF_MODEL_URL = (
    "https://api-inference.huggingface.co/models/"
    "mistralai/Mistral-7B-Instruct-v0.2"
)

SYSTEM_PROMPT = """You are ShopBot, an intelligent assistant for an AI-powered
e-commerce platform. You help customers:
- Find and compare products
- Understand product features and specifications
- Get personalized recommendations
- Answer questions about categories, pricing, and availability

Keep your answers concise, friendly, and helpful. If you do not know something,
say so honestly. Do NOT make up product details."""


def chat(messages: list, context_products: list = None) -> str:
    """
    Generate a chatbot reply.

    Args:
        messages: List of {"role": "user"|"assistant", "content": str}
        context_products: Optional list of product dicts to ground the reply.

    Returns:
        str: The assistant reply.
    """
    # Optionally inject product context into the system prompt
    system = SYSTEM_PROMPT
    if context_products:
        names   = ", ".join(p.get("name", "") for p in context_products[:5])
        system += f"\n\nRelevant products the user may be interested in: {names}."

    if LLM_PROVIDER == "openai":
        return _openai_chat(system, messages)
    else:
        return _huggingface_chat(system, messages)


# ── OpenAI backend ────────────────────────────────────────────────────────────

def _openai_chat(system: str, messages: list) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        full_messages = [{"role": "system", "content": system}] + messages
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=full_messages,
            max_tokens=400,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Sorry, I'm having trouble connecting to the AI service. ({e})"


# ── HuggingFace Inference API backend ─────────────────────────────────────────

def _huggingface_chat(system: str, messages: list) -> str:
    """
    Call HuggingFace Inference API.
    Formats conversation using Mistral's chat template.
    """
    try:
        # Build prompt in Mistral instruct format
        prompt = f"[INST] {system}\n\n"
        for i, msg in enumerate(messages):
            role    = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user":
                if i > 0:
                    prompt += f"\n[INST] {content} [/INST]"
                else:
                    prompt += f"{content} [/INST]"
            else:
                prompt += f" {content} "

        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 300,
                "temperature": 0.7,
                "return_full_text": False,
            }
        }

        resp = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, list) and data:
            return data[0].get("generated_text", "").strip()
        return "I'm sorry, I couldn't generate a response right now."

    except requests.exceptions.Timeout:
        return "The AI model is warming up — please try again in a moment!"
    except Exception as e:
        return f"Sorry, an error occurred: {e}"
