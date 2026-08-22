# SOTA Benchmark: Vector Stores & Hybrid Jurisprudential Retrieval

| Vector Store | Hybrid Search (BM25 + Dense) | Deployment Cost | Latency p95 |
| :--- | :---: | :---: | :---: |
| **Pinecone** | Parcial (Serverless) | $70 - $150/mo | 45ms |
| **Qdrant Cloud** | Nativo (RRF) | $25/mo / Free Tier | 18ms |
| **PostgreSQL + pgvector** | **Nativo (pg_trgm + HNSW)** | **$0 (Self-hosted/Docker)** | **12ms** |
