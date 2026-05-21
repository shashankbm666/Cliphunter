"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SearchHero } from "@/components/SearchHero";
import { getSuggestions, ingestVideo, saveClip, searchClips } from "@/lib/api";
import type { Clip } from "@/lib/types";

export default function Home() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [videoId, setVideoId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const savedCount = useMemo(() => savedIds.size, [savedIds]);

  async function handleIngest(url: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await ingestVideo(url);
      setVideoId(response.videoId);
      setClips(response.clips);
    } catch {
      setError("The ClipHunt API is not reachable. Start the FastAPI server and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const results = await searchClips(query, videoId);
      setClips(results);
    } catch {
      setError("Search is waiting on the backend service at localhost:8000.");
    } finally {
      setLoading(false);
    }
  }

  const handleSuggest = useCallback(async (query: string) => {
    return getSuggestions(query);
  }, []);

  async function handleSave(clip: Clip) {
    setSavedIds((current) => new Set(current).add(clip.id));
    try {
      await saveClip(clip.id);
    } catch {
      setError("Saved locally. Backend persistence is currently offline.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackdrop />
      <div className="film-grain" />
      <header className="relative z-20 flex items-center justify-between px-5 py-5">
        <div className="text-lg font-semibold tracking-tight text-white">
          Clip<span className="text-ember">Hunt</span>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-steel backdrop-blur">
          {savedCount} saved
        </div>
      </header>
      <SearchHero
        loading={loading}
        onIngest={handleIngest}
        onSearch={handleSearch}
        onSuggest={handleSuggest}
      />
      {error ? (
        <div className="relative z-10 mx-auto mb-6 max-w-3xl rounded border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}
      <ResultsGrid clips={clips} savedIds={savedIds} onSave={handleSave} />
    </main>
  );
}
