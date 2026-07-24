"""
Solid LLM - inference engine.

Loads the trained from-scratch character model plus its tokenizer and config,
and exposes a single honest `generate(prompt, ...)` that runs the real pipeline:

    text -> tokenizer.encode -> model.generate -> tokenizer.decode -> text

There is no external API, no random-token placeholder, and no canned string:
the returned text is produced by the trained weights.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

import torch

_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from training.model import SolidLLM, SolidLLMConfig  # noqa: E402
from training.tokenizer import CharTokenizer  # noqa: E402

MODELS = _REPO_ROOT / "models"
CKPT = MODELS / "solid-llm-char.pth"
TOK_PATH = MODELS / "tokenizer.json"
CFG_PATH = MODELS / "config.json"


class SolidLLMEngine:
    def __init__(self, device: str = "cpu"):
        if not CKPT.exists():
            raise FileNotFoundError(
                f"checkpoint not found at {CKPT}. Train it first: "
                f"python training/train.py"
            )
        self.device = device
        cfg_dict = json.loads(CFG_PATH.read_text(encoding="utf-8"))
        self.config = SolidLLMConfig(**cfg_dict)
        self.tokenizer = CharTokenizer.load(TOK_PATH)
        self.model = SolidLLM(self.config)
        self.model.load_state_dict(torch.load(CKPT, map_location=device))
        self.model.to(device).eval()

    @property
    def num_params(self) -> int:
        return self.model.num_params()

    def generate(
        self,
        prompt: str,
        max_new_tokens: int = 200,
        temperature: float = 0.8,
        top_k: Optional[int] = 40,
    ) -> str:
        ids = self.tokenizer.encode(prompt)
        if not ids:
            ids = [self.tokenizer.bos_id]
        idx = torch.tensor([ids], dtype=torch.long, device=self.device)
        out = self.model.generate(
            idx,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_k=top_k,
            eos_id=self.tokenizer.eos_id,
        )
        full = self.tokenizer.decode(out[0].tolist())
        # return only the newly generated continuation
        return full[len(prompt):] if full.startswith(prompt) else full


_engine: Optional[SolidLLMEngine] = None


def get_engine() -> SolidLLMEngine:
    """Lazily construct a shared engine instance."""
    global _engine
    if _engine is None:
        _engine = SolidLLMEngine()
    return _engine


if __name__ == "__main__":
    eng = get_engine()
    print(f"loaded Solid LLM ({eng.num_params:,} params, vocab {eng.tokenizer.vocab_size})")
    print("prompt: 'Solid Solutions'")
    print("->", eng.generate("Solid Solutions", max_new_tokens=160))
