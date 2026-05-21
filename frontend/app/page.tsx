"use client";

import { useCallback, useMemo, useState } from "react";
import { AnalyzerPanel } from "@/components/AnalyzerPanel";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SavedClipsPanel } from "@/components/SavedClipsPanel";
import { SearchHero } from "@/components/SearchHero";
import { getSuggestions, ingestVideo, saveClip, searchClips } from "@/lib/api";
import type { Clip } from "@/lib/types";

type Mode = "search" | "analyzer" | "saved";

const modes: Array<{ id: Mode; label: string }> = [
  { id: "search", label: "Search" },
  { id: "analyzer", label: "Analyzer" },
  { id: "saved", label: "Saved Clips" }
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("search");
  const [searchClipsList, setSearchClipsList] = useState<Clip[]>([]);
  const [analyzerClips, setAnalyzerClips] = useState<Clip[]>([]);
  const [analyzerVideoId, setAnalyzerVideoId] = useState<string | undefined>();
  const [savedClips, setSavedClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const savedCount = useMemo(() => savedIds.size, [savedIds]);

  async function handleAnalyze(url: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await ingestVideo(url);
      setAnalyzerVideoId(response.videoId);
      setAnalyzerClips(response.clips);
    } catch {
      setError("Analyzer only accepts valid YouTube URLs. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    try {
      const results = await searchClips(query);
      setSearchClipsList(results);
    } catch {
      setError("Backend service is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchWithinAnalyzer(query: string) {
    if (!analyzerVideoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await searchClips(query, analyzerVideoId);
      setAnalyzerClips(results);
    } catch {
      setError("Could not search within the analyzed video.");
    } finally {
      setLoading(false);
    }
  }

  const handleSuggest = useCallback(async (query: string) => {
    return getSuggestions(query);
  }, []);

  async function handleSave(clip: Clip) {
    setSavedIds((current) => new Set(current).add(clip.id));
    setSavedClips((current) => {
      if (current.some((savedClip) => savedClip.id === clip.id)) return current;
      return [clip, ...current];
    });
    try {
      await saveClip(clip.id);
    } catch {
      setError("Saved locally. Backend persistence did not accept this clip yet.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackdrop />
      <div className="film-grain" />
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-5">
        <div className="text-lg font-semibold tracking-tight text-white">
          Clip<span className="text-ember">Hunt</span>
        </div>
        <nav className="flex rounded border border-white/10 bg-white/[0.06] p-1 backdrop-blur">
          {modes.map((item) => (
            <button
              key={item.id}
              className={`rounded px-3 py-2 text-sm transition ${
                mode === item.id
                  ? "bg-white text-ink"
                  : "text-steel hover:bg-white/[0.08] hover:text-white"
              }`}
              onClick={() => setMode(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-steel backdrop-blur transition hover:text-white"
          onClick={() => setMode("saved")}
          type="button"
        >
          {savedCount} saved
        </button>
      </header>

      {error ? (
        <div className="relative z-10 mx-auto mb-6 max-w-3xl rounded border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      {mode === "search" ? (
        <>
          <SearchHero loading={loading} onSearch={handleSearch} onSuggest={handleSuggest} />
          <ResultsGrid
            clips={searchClipsList}
            savedIds={savedIds}
            onSave={handleSave}
            eyebrow="ClipHunt Search"
            title="Footage-first YouTube results"
            emptyText="Search for real footage moments like car crash, cat running, crowd cheering."
          />
        </>
      ) : null}

      {mode === "analyzer" ? (
        <AnalyzerPanel
          clips={analyzerClips}
          loading={loading}
          savedIds={savedIds}
          onAnalyze={handleAnalyze}
          onSearchWithin={handleSearchWithinAnalyzer}
          onSave={handleSave}
        />
      ) : null}

      {mode === "saved" ? (
        <SavedClipsPanel clips={savedClips} savedIds={savedIds} onSave={handleSave} />
      ) : null}
    </main>
  );
}
