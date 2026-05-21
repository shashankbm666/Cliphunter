from pydantic import BaseModel, Field


class VideoIngestRequest(BaseModel):
    youtube_url: str = Field(min_length=8, max_length=300)


class SaveClipRequest(BaseModel):
    clip_id: str = Field(min_length=1, max_length=120)


class Clip(BaseModel):
    id: str
    videoId: str
    title: str
    thumbnail: str
    timestamp: str
    seconds: int
    description: str
    tags: list[str]
    confidence: float
    sourceLabel: str = "Indexed YouTube video"
    sourceUrl: str | None = None


class IngestResponse(BaseModel):
    videoId: str
    title: str
    status: str
    clips: list[Clip]
