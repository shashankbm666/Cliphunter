"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, Search } from "lucide-react";
import type { Clip } from "@/lib/types";
import { ResultsGrid } from "./ResultsGrid";

type AnalyzerPanelProps = {
  clips: Clip[];
  loading: boolean;
  savedIds: Set<string>;
  onAnalyze: (url: string) => Promise<void>;
  onSearchWithin: (query: string) => Promise<void>;
  onSave: (clip: Clip) => void;
};

export function AnalyzerPanel({
  clips,
  loading,
  savedIds,
  onAnalyze,
  onSearchWithin,
  onSave
}: AnalyzerPanelProps) {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");

  async function submitAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    await onAnalyze(url.trim());
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    await onSearchWithin(query.trim());
  }

  return (
    <section className="relative z-10 px-5 pb-12 pt-8">
      <div className="mx-auto w-full max-w-5xl">
        <motion.div
          className="rounded border border-white/10 bg-black/45 p-4 shadow-glow backdrop-blur-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
            YouTube Video Analyzer
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
            Analyze one video.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
            Paste a YouTube URL to create timestamped scene moments for that single video. This is separate from general ClipHunt Search.
          </p>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={submitAnalyze}>
            <label className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
              <input
                aria-label="YouTube video URL"
                className="h-14 w-full rounded border border-white/10 bg-white/[0.06] pl-12 pr-4 text-sm text-white outline-none transition focus:border-ember"
                placeholder="Paste a YouTube URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>
            <button
              className="inline-flex h-14 items-center justify-center gap-2 rounded bg-white px-5 text-sm font-semibold text-ink transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Analyze
            </button>
          </form>

          <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ember" />
              <input
                aria-label="Search within analyzed video"
                className="h-12 w-full rounded border border-white/10 bg-ink/90 pl-12 pr-4 text-sm text-white outline-none transition focus:border-gold"
                placeholder="Search within analyzed video: close-up, dialogue, action..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded bg-ember px-5 text-sm font-semibold text-white transition hover:bg-[#ff715d] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || clips.length === 0}
              type="submit"
            >
              <Search className="h-4 w-4" />
              Search Video
            </button>
          </form>
        </motion.div>
      </div>

      <div className="mt-8">
        <ResultsGrid
          clips={clips}
          savedIds={savedIds}
          onSave={onSave}
          eyebrow="Analyzer"
          title="Timestamped moments"
          emptyText="Paste a YouTube URL to analyze one video."
        />
      </div>
    </section>
  );
}
