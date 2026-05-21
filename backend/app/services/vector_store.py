from __future__ import annotations

from app.models import Clip
from app.services.demo_catalog import DEMO_CLIPS


ALIASES = {
    "cats": "cat",
    "kittens": "cat",
    "kitten": "cat",
    "dogs": "dog",
    "puppy": "dog",
    "puppies": "dog",
    "ran": "running",
    "run": "running",
    "runs": "running",
    "sprinting": "running",
    "sprint": "running",
    "chased": "chase",
    "chasing": "chase",
}

STOP_WORDS = {"from", "with", "the", "and", "for", "into", "that", "this"}


def normalize_terms(text: str) -> list[str]:
    raw_terms = [
        term.strip(".,!?;:()[]{}\"'").lower()
        for term in text.replace("-", " ").split()
    ]
    return [
        ALIASES.get(term, term)
        for term in raw_terms
        if len(term) > 2 and term not in STOP_WORDS
    ]


class InMemoryVectorStore:
    def __init__(self) -> None:
        self._clips: dict[str, Clip] = {clip.id: clip for clip in DEMO_CLIPS}
        self._saved: dict[str, Clip] = {}

    def upsert_many(self, clips: list[Clip]) -> None:
        for clip in clips:
            self._clips[clip.id] = clip

    def search(self, query: str, video_id: str | None = None) -> list[Clip]:
        terms = normalize_terms(query)
        if "from dog" in query.lower() and "chase" not in terms:
            terms.append("chase")
        if not terms:
            return list(self._clips.values())[:12]

        def clip_terms(clip: Clip) -> set[str]:
            return set(normalize_terms(" ".join([clip.description, *clip.tags, clip.title])))

        def score(clip: Clip) -> tuple[float, int, float]:
            indexed_terms = clip_terms(clip)
            matches = sum(1 for term in terms if term in indexed_terms)
            coverage = matches / len(set(terms))
            exact_tag_bonus = sum(1 for term in terms if term in {ALIASES.get(tag, tag) for tag in clip.tags})
            title_bonus = sum(0.5 for term in terms if term in normalize_terms(clip.title))
            return (coverage * 10 + exact_tag_bonus + title_bonus + clip.confidence, matches, clip.confidence)

        candidates = [
            clip
            for clip in self._clips.values()
            if video_id is None or clip.videoId == video_id
        ]
        ranked = [(clip, score(clip)) for clip in candidates]
        strong = [item for item in ranked if item[1][1] == len(set(terms))]
        fallback = [item for item in ranked if item[1][1] > 0]
        selected = strong or fallback
        return [clip for clip, _ in sorted(selected, key=lambda item: item[1], reverse=True)[:18]]

    def suggestions(self, query: str) -> list[str]:
        from app.services.demo_catalog import SUGGESTIONS

        normalized = query.lower().strip()
        if not normalized:
            return [
                "person running through rain",
                "car driving at night",
                "crowd cheering",
                "close up hand turning key",
                "city skyline sunset",
                "fast action chase",
            ]
        direct = [suggestion for suggestion in SUGGESTIONS if normalized in suggestion]
        related = [
            suggestion
            for suggestion in SUGGESTIONS
            if suggestion not in direct
            and any(term in suggestion for term in normalized.split() if len(term) > 2)
        ]
        generated = [
            normalized,
            f"{normalized} close up",
            f"{normalized} wide shot",
            f"{normalized} slow motion",
            f"{normalized} at night",
            f"{normalized} cinematic",
        ]
        unique = []
        for suggestion in [*direct, *related, *generated]:
            if suggestion not in unique:
                unique.append(suggestion)
        return unique[:6]

    def save(self, clip: Clip) -> Clip:
        self._saved[clip.id] = clip
        return clip

    def get(self, clip_id: str) -> Clip | None:
        return self._clips.get(clip_id)

    def save_by_id(self, clip_id: str) -> Clip | None:
        clip = self.get(clip_id)
        if clip:
            self._saved[clip.id] = clip
        return clip

    def saved(self) -> list[Clip]:
        return list(self._saved.values())


vector_store = InMemoryVectorStore()
