---
title: Enterprise RAG Chatbot
description: Internship Proof-of-Concept of an enterprise chatbot grounded in company documents. Sensitive prompts stay on an on-prem LLM, everything else can use commercial APIs, and low-confidence answers escalate to a human helpdesk. I built the RAG pipeline, chat history, PDF export, source citations and confidence scoring.
tags:
  - Python
  - FastAPI
  - Next.js
  - PostgreSQL
  - ChromaDB
  - Ollama
  - Docker
repo: https://github.com/jonathankenan/enterprise-rag-chatbot
order: 0
draft: false
---

Built during my internship as a two-person team. Hybrid retrieval (ChromaDB dense vectors + BM25), PII masking with Presidio, LLM routing between Ollama and Groq/Gemini/Mistral/Cloudflare, JWT + MFA auth, and automatic helpdesk ticketing when retrieval confidence is low.
