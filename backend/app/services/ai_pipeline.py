from __future__ import annotations

from app.models import Clip, IngestResponse
from app.services.security import (
    extract_youtube_video_id,
    youtube_thumbnail_url,
    youtube_watch_url,
)


def format_timestamp(seconds: int) -> str:
    minutes, remainder = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{remainder:02d}"
    return f"{minutes:02d}:{remainder:02d}"


SCENES = [
    (
        12,
        "A crisp establishing frame with strong contrast, giving editors a clean opening beat.",
        ["establishing", "wide", "intro"],
    ),
    (
        38,
        "A focused subject moment with readable expression and room for captions in the frame.",
        ["subject", "caption-ready", "detail"],
    ),
    (
        74,
        "A kinetic passage with faster movement, useful for transitions and rhythm changes.",
        ["motion", "transition", "energy"],
    ),
    (
        126,
        "A quieter visual pause with balanced composition and a cinematic hold.",
        ["ambient", "pause", "cinematic"],
    ),
    (
        181,
        "A high-signal moment where dialogue, action, and visual context align clearly.",
        ["dialogue", "action", "highlight"],
    ),
]


async def analyze_youtube_video(youtube_url: str) -> IngestResponse:
    video_id = extract_youtube_video_id(youtube_url)
    title = f"YouTube video {video_id}"
    clips = [
        Clip(
            id=f"{video_id}-{seconds}",
            videoId=video_id,
            title=title,
            thumbnail=youtube_thumbnail_url(video_id),
            timestamp=format_timestamp(seconds),
            seconds=seconds,
            description=description,
            tags=tags,
            confidence=max(0.78, 0.96 - index * 0.035),
            sourceLabel=f"Indexed YouTube video {video_id}",
            sourceUrl=youtube_watch_url(video_id, seconds),
        )
        for index, (seconds, description, tags) in enumerate(SCENES)
    ]
    return IngestResponse(videoId=video_id, title=title, status="indexed", clips=clips)
