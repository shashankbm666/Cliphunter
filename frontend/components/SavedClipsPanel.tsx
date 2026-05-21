"use client";

import type { Clip } from "@/lib/types";
import { ResultsGrid } from "./ResultsGrid";

type SavedClipsPanelProps = {
  clips: Clip[];
  savedIds: Set<string>;
  onSave: (clip: Clip) => void;
};

export function SavedClipsPanel({ clips, savedIds, onSave }: SavedClipsPanelProps) {
  return (
    <section className="relative z-10 px-5 pb-12 pt-8">
      <div className="mx-auto mb-8 w-full max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
          Library
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Saved clips.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
          Your selected footage and analyzed moments stay here while you work.
        </p>
      </div>
      <ResultsGrid
        clips={clips}
        savedIds={savedIds}
        onSave={onSave}
        eyebrow="Saved"
        title="Saved clips"
        emptyText="No saved clips yet."
      />
    </section>
  );
}
