"""
Build the training corpus for the from-scratch Solid LLM.

The corpus is 100% first-party text (authored by us / templated from our own
vocabulary), so there are no third-party copyright concerns. It combines:

  * the factual knowledge base (data/knowledge.md), repeated a few times so the
    model reliably learns company-specific vocabulary, and
  * a large set of templated, grammatical English sentences about Solid
    Solutions, SolidAI, and African technology, which teach the model general
    English structure at the character level.

Run:  python data/build_corpus.py
Out:  data/corpus.txt
"""

from __future__ import annotations

import itertools
import random
from pathlib import Path

HERE = Path(__file__).resolve().parent

# --- vocabulary for templated sentences -----------------------------------
ORGS = ["Solid Solutions", "SolidAI", "Solid LLM", "the SolidAI team", "our research team"]
VERBS = [
    "builds", "designs", "develops", "trains", "deploys", "researches",
    "optimizes", "engineers", "supports", "improves",
]
ADJS = [
    "practical", "efficient", "privacy-first", "low-power", "hyper-local",
    "reliable", "resilient", "sovereign", "affordable", "scalable",
]
THINGS = [
    "AI models", "language models", "edge inference", "mobile money tools",
    "crop-disease detection", "digital infrastructure", "natural language processing",
    "financial inclusion services", "clean-energy platforms", "healthcare tools",
]
SECTORS = [
    "agriculture", "health", "education", "finance", "legal services",
    "transport", "energy", "logistics", "small businesses", "rural communities",
]
PLACES = [
    "Africa", "the African continent", "African markets", "local communities",
    "underserved regions", "growing cities", "rural areas",
]
BENEFITS = [
    "so it runs on low-power hardware",
    "while keeping sensitive data private",
    "to reach people beyond the cloud",
    "in dozens of local dialects",
    "with fast, low-latency responses",
    "at a cost communities can afford",
    "without constant internet access",
    "to power the next generation of digital services",
]

TEMPLATES = [
    "{org} {verb} {adj} {thing} for {place}.",
    "{org} {verb} {thing} {benefit}.",
    "In {sector}, {org} {verb} {adj} {thing} for {place}.",
    "{org} focuses on {adj} {thing} {benefit}.",
    "For {place}, {org} {verb} {thing} that serve {sector}.",
    "Our mission is to bring {adj} {thing} to {sector} across {place}.",
    "{org} {verb} {thing}, {benefit}.",
    "We {verb_bare} {adj} {thing} for {sector} in {place}.",
]


def verb_bare(v: str) -> str:
    # crude third-person -> base form for the "We ..." template
    if v.endswith("ies"):
        return v[:-3] + "y"
    if v.endswith("es") and v[:-2].endswith(("s", "x", "z", "ch", "sh")):
        return v[:-2]
    if v.endswith("s"):
        return v[:-1]
    return v


def generate_sentences(n: int, seed: int = 7) -> list[str]:
    rng = random.Random(seed)
    out: list[str] = []
    for _ in range(n):
        t = rng.choice(TEMPLATES)
        v = rng.choice(VERBS)
        out.append(
            t.format(
                org=rng.choice(ORGS),
                verb=v,
                verb_bare=verb_bare(v),
                adj=rng.choice(ADJS),
                thing=rng.choice(THINGS),
                sector=rng.choice(SECTORS),
                place=rng.choice(PLACES),
                benefit=rng.choice(BENEFITS),
            )
        )
    return out


def build() -> str:
    parts: list[str] = []

    # 1. Factual knowledge base, repeated so key facts are well learned.
    kb = (HERE / "knowledge.md").read_text(encoding="utf-8")
    # strip markdown headings/markers to keep the corpus prose-like
    kb_prose = "\n".join(
        line for line in kb.splitlines()
        if line.strip() and not line.strip().startswith("#")
    )
    parts.extend([kb_prose] * 4)

    # 2. Templated first-party sentences (the bulk of the corpus).
    sentences = generate_sentences(6000)
    # group into short paragraphs for a bit of longer-range structure
    for i in range(0, len(sentences), 4):
        parts.append(" ".join(sentences[i : i + 4]))

    text = "\n\n".join(parts) + "\n"
    return text


def main() -> None:
    text = build()
    out = HERE / "corpus.txt"
    out.write_text(text, encoding="utf-8")
    print(f"wrote {out} ({len(text):,} chars, {len(set(text))} unique chars)")


if __name__ == "__main__":
    main()
