# ClipHunt

Modern cinematic web app for finding exact moments inside YouTube videos with AI semantic search.

## Stack

- Frontend: Next.js, TailwindCSS, Framer Motion
- Backend: Python FastAPI
- AI pipeline target: OpenAI embeddings, Whisper transcription, CLIP scene understanding
- Data target: PostgreSQL plus vector search

## Run locally

```bash
cd frontend
npm install
npm run dev
```

In a second terminal:

```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8010
```

Open `http://localhost:3000`.

To start PostgreSQL with pgvector:

```bash
docker compose up -d postgres
```

For the heavyweight ingestion worker dependencies:

```bash
pip install -r backend/requirements-ai.txt
```

## Current V1 behavior

The backend exposes the intended ingestion, semantic search, and saved clip APIs with deterministic mock processing. Replace `backend/app/services/ai_pipeline.py` and `backend/app/services/vector_store.py` with real Whisper, CLIP, OpenAI embedding, PostgreSQL, and vector database implementations.
