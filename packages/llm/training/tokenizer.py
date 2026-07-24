"""
Solid LLM - Character-level tokenizer.

A real, deterministic tokenizer that maps text <-> integer ids. The vocabulary
is learned from a training corpus (every unique character that appears), plus a
handful of special tokens. It serialises to / from a small JSON file so the same
mapping is used at train time and inference time.

This replaces the earlier placeholder that used `ord(c) % vocab_size`, which was
not reversible and could not round-trip text.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, List

# Special tokens. <pad> must be id 0 so padded positions are easy to mask.
PAD = "<pad>"
BOS = "<bos>"  # beginning of sequence
EOS = "<eos>"  # end of sequence
UNK = "<unk>"  # unknown character (unseen at training time)
SPECIALS = [PAD, BOS, EOS, UNK]


class CharTokenizer:
    """Reversible character-level tokenizer."""

    def __init__(self, itos: List[str]):
        # itos: list of tokens indexed by id. stoi: reverse mapping.
        self.itos = list(itos)
        self.stoi = {tok: i for i, tok in enumerate(self.itos)}
        for name in (PAD, BOS, EOS, UNK):
            if name not in self.stoi:
                raise ValueError(f"tokenizer missing required special token {name!r}")
        self.pad_id = self.stoi[PAD]
        self.bos_id = self.stoi[BOS]
        self.eos_id = self.stoi[EOS]
        self.unk_id = self.stoi[UNK]

    @property
    def vocab_size(self) -> int:
        return len(self.itos)

    # --- construction ------------------------------------------------------
    @classmethod
    def from_text(cls, text: str) -> "CharTokenizer":
        """Build a vocabulary from every unique character in `text`."""
        chars = sorted(set(text))
        itos = list(SPECIALS) + [c for c in chars if c not in SPECIALS]
        return cls(itos)

    # --- encode / decode ---------------------------------------------------
    def encode(self, text: str, add_bos: bool = False, add_eos: bool = False) -> List[int]:
        ids = [self.stoi.get(ch, self.unk_id) for ch in text]
        if add_bos:
            ids = [self.bos_id] + ids
        if add_eos:
            ids = ids + [self.eos_id]
        return ids

    def decode(self, ids: Iterable[int], skip_special: bool = True) -> str:
        out: List[str] = []
        specials = {self.pad_id, self.bos_id, self.eos_id, self.unk_id}
        for i in ids:
            i = int(i)
            if skip_special and i in specials:
                continue
            if 0 <= i < len(self.itos):
                out.append(self.itos[i])
        return "".join(out)

    # --- persistence -------------------------------------------------------
    def save(self, path: str | Path) -> None:
        path = Path(path)
        path.write_text(json.dumps({"itos": self.itos}, ensure_ascii=False), encoding="utf-8")

    @classmethod
    def load(cls, path: str | Path) -> "CharTokenizer":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        return cls(data["itos"])


if __name__ == "__main__":
    tok = CharTokenizer.from_text("Solid Solutions builds AI for Africa.")
    ids = tok.encode("Solid AI", add_bos=True, add_eos=True)
    assert tok.decode(ids) == "Solid AI", tok.decode(ids)
    print(f"vocab_size={tok.vocab_size} roundtrip OK -> {tok.decode(ids)!r}")
