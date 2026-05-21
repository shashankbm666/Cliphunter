"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, Plus, Search } from "lucide-react";
import { defaultSuggestions } from "@/lib/demoClips";

type SearchHeroProps = {
  onIngest: (url: string) => Promise<void>;
  onSearch: (query: string) => Promise<void>;
  onSuggest: (query: string) => Promise<string[]>;
  loading: boolean;
};

export function SearchHero({ onIngest, onSearch, onSuggest, loading }: SearchHeroProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const [showIngest, setShowIngest] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setSuggestions(await onSuggest(query));
      } catch {
        const normalized = query.toLowerCase();
        setSuggestions(
          defaultSuggestions.filter((suggestion) => suggestion.includes(normalized)).slice(0, 5)
        );
      }
    }, 140);
    return () => window.clearTimeout(timer);
  }, [query, onSuggest]);

  async function submitVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!youtubeUrl.trim()) return;
    await onIngest(youtubeUrl.trim());
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    await onSearch(query.trim());
  }

  return (
    <section className="relative z-10 px-5 pb-12 pt-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.p
          className="mb-5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-steel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI semantic clip finder
        </motion.p>
        <motion.h1
          className="max-w-4xl text-4xl font-semibold leading-[1.05] text-white sm:text-6xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          Search moments, not videos.
        </motion.h1>
        <motion.p
          className="mt-4 max-w-2xl text-base leading-7 text-steel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          Search YouTube first, then index a video for timestamp-level scene analysis.
        </motion.p>

        <motion.div
          className="mt-8 grid w-full gap-3 rounded border border-white/10 bg-black/45 p-3 shadow-glow backdrop-blur-xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ember" />
              <input
                aria-label="Natural language clip search"
                className="h-16 w-full rounded border border-ember/30 bg-ink/90 pl-12 pr-4 text-base text-white outline-none transition placeholder:text-steel/70 focus:border-gold"
                placeholder="Search YouTube, for example: car crashing"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button
              className="inline-flex h-16 items-center justify-center gap-2 rounded bg-ember px-6 text-sm font-semibold text-white transition hover:bg-[#ff715d] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Hunt
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 text-left hide-scrollbar">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-steel transition hover:border-ember hover:text-white"
                onClick={() => {
                  setQuery(suggestion);
                  void onSearch(suggestion);
                }}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <p className="px-1 text-left text-xs leading-5 text-steel">
            Results prioritize real footage and downrank slideshow, explainer, simulation, and photo-only videos.
          </p>

          <button
            className="inline-flex w-fit items-center gap-2 px-1 py-1 text-xs font-medium text-steel transition hover:text-white"
            onClick={() => setShowIngest((value) => !value)}
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            Index a specific YouTube video
          </button>

          {showIngest ? (
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitVideo}>
              <label className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
                <input
                  aria-label="YouTube video URL"
                  className="h-12 w-full rounded border border-white/10 bg-white/[0.06] pl-12 pr-4 text-sm text-white outline-none transition focus:border-ember"
                  placeholder="Paste YouTube URL to add it to this search index"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                />
              </label>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded bg-white px-5 text-sm font-semibold text-ink transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Index
              </button>
            </form>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
