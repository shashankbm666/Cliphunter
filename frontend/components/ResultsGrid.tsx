"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Play } from "lucide-react";
import type { Clip } from "@/lib/types";

type ResultsGridProps = {
  clips: Clip[];
  savedIds: Set<string>;
  onSave: (clip: Clip) => void;
  title?: string;
  eyebrow?: string;
  emptyText?: string;
};

export function ResultsGrid({
  clips,
  savedIds,
  onSave,
  title = "YouTube results",
  eyebrow = "Results",
  emptyText = "No matching clips yet."
}: ResultsGridProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {title}
          </h2>
        </div>
        <p className="text-sm text-steel">{clips.length} matches</p>
      </div>

      {clips.length === 0 ? (
        <div className="rounded border border-white/10 bg-white/[0.04] p-8 text-center text-steel">
          {emptyText}
        </div>
      ) : null}

      <div className="grid gap-3">
        {clips.map((clip, index) => {
          const isYouTubeUrl =
            typeof clip.sourceUrl === "string" &&
            /^https:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}(&t=\d+s)?$/.test(clip.sourceUrl);
          const canOpen = isYouTubeUrl;
          return (
          <motion.article
            key={clip.id}
            className="group grid gap-4 rounded border border-white/10 bg-white/[0.045] p-3 backdrop-blur transition hover:border-ember/60 md:grid-cols-[260px_1fr]"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: index * 0.03 }}
            onMouseEnter={() => setPreviewId(clip.id)}
            onMouseLeave={() => setPreviewId(null)}
          >
            <div className="relative aspect-video overflow-hidden rounded bg-black">
              {previewId === clip.id && canOpen ? (
                <iframe
                  aria-hidden
                  className="absolute inset-0 h-full w-full opacity-0 transition duration-300 group-hover:opacity-100"
                  src={`https://www.youtube.com/embed/${clip.videoId}?start=${clip.seconds}&autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1`}
                  title={`${clip.title} preview at ${clip.timestamp}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                />
              ) : null}
              {clip.thumbnail ? (
                <img
                  alt={clip.description}
                  className="relative h-full w-full object-cover transition duration-300 group-hover:opacity-0"
                  src={clip.thumbnail}
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#16181f,#252934)] px-5 text-center text-sm font-semibold text-steel">
                  No thumbnail
                </div>
              )}
              <div className="absolute left-2 top-2 rounded bg-black/80 px-2.5 py-1 text-sm font-semibold text-white">
                {clip.timestamp}
              </div>
              {canOpen ? (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col justify-between gap-4 py-1">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-ember px-2 py-1 text-xs font-semibold text-white">
                    {Math.round(clip.confidence * 100)}% match
                  </span>
                  <span className="text-xs text-steel">{clip.sourceLabel}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{clip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">
                  <span className="font-semibold text-white">Matched moment: </span>
                  {clip.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {clip.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-white/10 bg-black/25 px-2 py-1 text-xs text-steel"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canOpen ? (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold"
                    href={clip.sourceUrl ?? "#"}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open at {clip.timestamp}
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-steel">
                    Index a YouTube video for timestamps
                  </span>
                )}
                <button
                  aria-label="Save clip"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.06] px-3 text-sm text-white transition hover:border-ember hover:text-ember"
                  onClick={() => onSave(clip)}
                  type="button"
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={savedIds.has(clip.id) ? "currentColor" : "none"}
                  />
                  Save
                </button>
              </div>
            </div>
          </motion.article>
          );
        })}
      </div>
    </section>
  );
}
