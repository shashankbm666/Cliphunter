import type { Clip } from "./types";

export const starterClips: Clip[] = [
  {
    id: "cat-run-1",
    videoId: "demo-index",
    title: "Cat sprinting across room",
    thumbnail: "",
    timestamp: "00:21",
    seconds: 21,
    description:
      "A black and white cat runs quickly across a bright room, good for a playful chase or escape moment.",
    tags: ["cat", "running", "sprint", "fast", "indoor"],
    confidence: 0.98,
    sourceLabel: "Demo index - not a verified YouTube source",
    sourceUrl: null
  },
  {
    id: "cat-run-2",
    videoId: "demo-index",
    title: "Cat sudden run reaction",
    thumbnail: "",
    timestamp: "00:09",
    seconds: 9,
    description:
      "A cat suddenly starts running after reacting to something off camera, useful for quick comedy edits.",
    tags: ["cat", "running", "reaction", "funny", "fast"],
    confidence: 0.96,
    sourceLabel: "Demo index - not a verified YouTube source",
    sourceUrl: null
  },
  {
    id: "cat-run-3",
    videoId: "demo-index",
    title: "Cat running down hallway",
    thumbnail: "",
    timestamp: "00:42",
    seconds: 42,
    description:
      "A cat runs straight through a hallway with clear forward motion and a clean timestamped action beat.",
    tags: ["cat", "running", "hallway", "motion", "chase"],
    confidence: 0.95,
    sourceLabel: "Demo index - not a verified YouTube source",
    sourceUrl: null
  },
  {
    id: "dog-run-1",
    videoId: "demo-index",
    title: "Dog chasing person on sidewalk",
    thumbnail: "",
    timestamp: "00:18",
    seconds: 18,
    description:
      "A person runs along a sidewalk while a dog chases behind, creating a clear chase scene.",
    tags: ["dog", "running", "chase", "person", "street"],
    confidence: 0.97,
    sourceLabel: "Demo index - not a verified YouTube source",
    sourceUrl: null
  }
];

export const defaultSuggestions = [
  "cat running",
  "cat running down hallway",
  "cat running toward camera",
  "cat running after toy",
  "dog chasing person",
  "running from dog",
  "crowd cheering",
  "quiet rainy street",
  "car driving at night"
];
