import type { Clip, IngestResponse } from "./types";

const API_BASE = "https://heroic-rebirth-production-b3d6.up.railway.app";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "ClipHunt request failed");
  }

  return response.json() as Promise<T>;
}

export function ingestVideo(youtubeUrl: string) {
  return request<IngestResponse>("/api/videos/ingest", {
    method: "POST",
    body: JSON.stringify({ youtube_url: youtubeUrl })
  });
}

export function searchClips(query: string, videoId?: string) {
  const params = new URLSearchParams({ q: query });
  if (videoId) params.set("video_id", videoId);
  return request<Clip[]>(`/api/search?${params.toString()}`);
}

export function getSuggestions(query: string) {
  const params = new URLSearchParams({ q: query });
  return request<string[]>(`/api/suggestions?${params.toString()}`);
}

export function saveClip(clipId: string) {
  return request<{ saved: boolean; clip: Clip }>("/api/clips/save", {
    method: "POST",
    body: JSON.stringify({ clip_id: clipId })
  });
}
