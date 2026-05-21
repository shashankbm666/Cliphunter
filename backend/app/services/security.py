from __future__ import annotations

import time
from collections import defaultdict, deque
from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException, Request, status


YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > window_seconds:
            hits.popleft()
        if len(hits) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again shortly.",
            )
        hits.append(now)


rate_limiter = RateLimiter()


def client_key(request: Request, bucket: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{bucket}:{host}"


def validate_youtube_video_id(video_id: str) -> str:
    if len(video_id) != 11 or not all(char.isalnum() or char in "_-" for char in video_id):
        raise HTTPException(status_code=400, detail="Invalid YouTube video id.")
    return video_id


def extract_youtube_video_id(url: str) -> str:
    parsed = urlparse(url.strip())
    host = parsed.netloc.lower()
    if host not in YOUTUBE_HOSTS:
        raise HTTPException(status_code=400, detail="Only YouTube URLs are supported.")

    if host == "youtu.be":
        video_id = parsed.path.strip("/").split("/")[0]
    elif parsed.path.startswith("/embed/"):
        video_id = parsed.path.split("/")[2]
    elif parsed.path.startswith("/shorts/"):
        video_id = parsed.path.split("/")[2]
    else:
        video_id = parse_qs(parsed.query).get("v", [""])[0]

    return validate_youtube_video_id(video_id)


def youtube_watch_url(video_id: str, seconds: int | None = None) -> str:
    safe_id = validate_youtube_video_id(video_id)
    if seconds is None:
        return f"https://www.youtube.com/watch?v={safe_id}"
    safe_seconds = max(0, min(int(seconds), 24 * 60 * 60))
    return f"https://www.youtube.com/watch?v={safe_id}&t={safe_seconds}s"


def youtube_thumbnail_url(video_id: str) -> str:
    safe_id = validate_youtube_video_id(video_id)
    return f"https://i.ytimg.com/vi/{safe_id}/hqdefault.jpg"
