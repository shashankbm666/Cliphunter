from __future__ import annotations

import asyncio
import re

from backend.app.models import Clip
from backend.app.services.ai_pipeline import format_timestamp
from backend.app.services.security import (
    validate_youtube_video_id,
    youtube_thumbnail_url,
    youtube_watch_url,
)


def _keywords(text: str) -> list[str]:
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    stop = {"the", "and", "for", "with", "from", "this", "that", "you", "your", "video"}
    unique = []
    for word in words:
        if len(word) > 2 and word not in stop and word not in unique:
            unique.append(word)
    return unique[:6]


def _normalize_query(query: str) -> str:
    replacements = {
        "crashing": "crash",
        "crashed": "crash",
        "crashes": "crash",
        "running": "run",
        "chasing": "chase",
        "driving": "drive",
    }
    terms = []
    for term in re.findall(r"[a-zA-Z0-9]+", query.lower()):
        terms.append(replacements.get(term, term))
    return " ".join(terms)


def _visual_intent_query(query: str) -> str:
    normalized = _normalize_query(query)
    terms = set(_keywords(normalized))
    if {"crash", "accident"} & terms:
        return f"{normalized} real footage caught on camera dashcam"
    if {"run", "chase"} & terms:
        return f"{normalized} real footage action"
    if {"rain", "street", "city", "car"} & terms:
        return f"{normalized} footage cinematic"
    return f"{normalized} footage"


def _visual_quality_score(text: str, query: str) -> int:
    lowered = text.lower()
    query_terms = set(_keywords(_normalize_query(query)))

    bad_terms = {
        "slideshow": -10,
        "slide show": -10,
        "explained": -8,
        "explainer": -8,
        "analysis": -6,
        "documentary": -4,
        "podcast": -8,
        "reaction": -4,
        "photos": -9,
        "photo": -7,
        "pictures": -9,
        "images": -8,
        "presentation": -9,
        "story": -4,
        "news": -3,
    }
    virtual_terms = {
        "beamng": -9,
        "gta": -9,
        "simulation": -9,
        "simulator": -9,
        "gameplay": -9,
        "animated": -8,
        "animation": -8,
    }
    good_terms = {
        "footage": 6,
        "caught on camera": 8,
        "dashcam": 8,
        "cctv": 7,
        "real": 4,
        "live": 3,
        "camera": 4,
        "compilation": 2,
        "moment": 2,
        "scene": 2,
    }

    score = 0
    for term, value in bad_terms.items():
        if term in lowered:
            score += value

    allow_virtual = {"game", "simulation", "beamng", "gta"} & query_terms
    if not allow_virtual:
        for term, value in virtual_terms.items():
            if term in lowered:
                score += value

    for term, value in good_terms.items():
        if term in lowered:
            score += value

    if "crash" in query_terms and any(term in lowered for term in ["dashcam", "caught on camera", "cctv"]):
        score += 6
    return score


def _result_score(entry: dict, query: str) -> int:
    normalized_query = _normalize_query(query)
    query_terms = set(_keywords(normalized_query))
    text = " ".join(
        [
            entry.get("title") or "",
            entry.get("description") or "",
            entry.get("channel") or "",
        ]
    ).lower()
    normalized_text = _normalize_query(text)
    score = sum(3 for term in query_terms if term in normalized_text)
    if "crash" in query_terms and "crushing" in text and "crash" not in normalized_text:
        score -= 5
    if normalized_query in normalized_text:
        score += 4
    score += _visual_quality_score(text, query)
    return score


def _thumbnail(entry: dict) -> str:
    thumbnails = entry.get("thumbnails") or []
    if thumbnails:
        return (thumbnails[-1] or {}).get("url") or ""
    video_id = entry.get("id") or ""
    return youtube_thumbnail_url(video_id) if video_id else ""


def _entry_to_clip(entry: dict, query: str, index: int) -> Clip | None:
    video_id = entry.get("id")
    if not video_id:
        return None
    try:
        video_id = validate_youtube_video_id(video_id)
    except Exception:
        return None

    title = entry.get("title") or "YouTube result"
    description = entry.get("description") or entry.get("channel") or ""
    tags = _keywords(" ".join([query, title, description]))
    match_terms = set(_keywords(_normalize_query(query)))
    searchable = " ".join([title, description, " ".join(tags)]).lower()
    matches = sum(1 for term in match_terms if term in _normalize_query(searchable))
    quality = max(0, min(10, _visual_quality_score(searchable, query)))
    confidence = min(0.96, 0.58 + matches * 0.1 + quality * 0.02 + max(0, 6 - index) * 0.018)

    return Clip(
        id=f"yt-{video_id}",
        videoId=video_id,
        title=title,
        thumbnail=_thumbnail(entry),
        timestamp=format_timestamp(0),
        seconds=0,
        description=(
            description[:220]
            if description
            else f"YouTube result for '{query}'. Open the video to inspect the matching moment."
        ),
        tags=tags,
        confidence=round(confidence, 2),
        sourceLabel="YouTube result - footage-first ranking",
        sourceUrl=youtube_watch_url(video_id),
    )


def _search_sync(query: str, limit: int) -> list[Clip]:
    from yt_dlp import YoutubeDL

    options = {
        "extract_flat": True,
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
    }
    search_query = _visual_intent_query(query)
    with YoutubeDL(options) as ydl:
        data = ydl.extract_info(f"ytsearch{limit * 2}:{search_query}", download=False)

    entries = (data or {}).get("entries") or []
    scored_entries = [
        (entry, _result_score(entry or {}, query))
        for entry in entries
    ]
    relevant_entries = [
        entry
        for entry, score in sorted(scored_entries, key=lambda item: item[1], reverse=True)
        if score >= 4
    ]
    clips = []
    for index, entry in enumerate(relevant_entries[:limit]):
        clip = _entry_to_clip(entry or {}, query, index)
        if clip:
            clips.append(clip)
    return clips


async def search_youtube(query: str, limit: int = 12) -> list[Clip]:
    return await asyncio.to_thread(_search_sync, query, limit)
