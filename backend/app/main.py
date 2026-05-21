from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from app.models import Clip, IngestResponse, SaveClipRequest, VideoIngestRequest
from app.services.ai_pipeline import analyze_youtube_video
from app.services.security import client_key, rate_limiter
from app.services.vector_store import vector_store
from app.services.youtube_search import search_youtube

app = FastAPI(title="ClipHunt API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/videos/ingest", response_model=IngestResponse)
async def ingest_video(payload: VideoIngestRequest, request: Request) -> IngestResponse:
    rate_limiter.check(client_key(request, "ingest"), limit=12, window_seconds=60)
    result = await analyze_youtube_video(payload.youtube_url)
    vector_store.upsert_many(result.clips)
    return result


@app.get("/api/search", response_model=list[Clip])
async def search_clips(
    request: Request,
    q: str = Query(min_length=1),
    video_id: str | None = None,
) -> list[Clip]:
    rate_limiter.check(client_key(request, "search"), limit=30, window_seconds=60)
    q = q.strip()
    if len(q) > 120:
        raise HTTPException(status_code=400, detail="Search query is too long.")
    indexed = vector_store.search(q, video_id)
    if video_id:
        return indexed
    try:
        youtube_results = await search_youtube(q)
    except Exception:
        youtube_results = []
    vector_store.upsert_many(youtube_results)
    return youtube_results


@app.get("/api/suggestions", response_model=list[str])
def suggestions(request: Request, q: str = "") -> list[str]:
    rate_limiter.check(client_key(request, "suggestions"), limit=90, window_seconds=60)
    q = q.strip()[:80]
    return vector_store.suggestions(q)


@app.post("/api/clips/save")
def save_clip(payload: SaveClipRequest, request: Request) -> dict[str, object]:
    rate_limiter.check(client_key(request, "save"), limit=60, window_seconds=60)
    clip = vector_store.save_by_id(payload.clip_id)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found in server index.")
    return {"saved": True, "clip": clip}


@app.get("/api/clips/saved", response_model=list[Clip])
def saved_clips() -> list[Clip]:
    return vector_store.saved()
