"""
Solid LLM - training script (real, from scratch).

Trains the character-level SolidLLM (training/model.py) on the first-party
corpus (data/corpus.txt). Saves three artefacts into models/:

  * solid-llm-char.pth  - model weights (state_dict)
  * tokenizer.json      - the character vocabulary
  * config.json         - the model hyper-parameters

Run:  python training/train.py            # default ~1500 steps
      python training/train.py --steps 3000 --block-size 128

Everything runs on CPU in a few minutes for the default size.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import torch

_REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_REPO_ROOT))

from training.model import SolidLLM, SolidLLMConfig  # noqa: E402
from training.tokenizer import CharTokenizer  # noqa: E402

DATA = _REPO_ROOT / "data" / "corpus.txt"
MODELS = _REPO_ROOT / "models"
CKPT = MODELS / "solid-llm-char.pth"
TOK_PATH = MODELS / "tokenizer.json"
CFG_PATH = MODELS / "config.json"


def get_batch(data: torch.Tensor, block_size: int, batch_size: int):
    ix = torch.randint(0, len(data) - block_size - 1, (batch_size,))
    x = torch.stack([data[i : i + block_size] for i in ix])
    y = torch.stack([data[i + 1 : i + 1 + block_size] for i in ix])
    return x, y


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--steps", type=int, default=1500)
    ap.add_argument("--batch-size", type=int, default=32)
    ap.add_argument("--block-size", type=int, default=128)
    ap.add_argument("--n-embd", type=int, default=256)
    ap.add_argument("--n-layer", type=int, default=4)
    ap.add_argument("--n-head", type=int, default=4)
    ap.add_argument("--lr", type=float, default=3e-4)
    ap.add_argument("--seed", type=int, default=1337)
    args = ap.parse_args()

    torch.manual_seed(args.seed)
    MODELS.mkdir(exist_ok=True)

    if not DATA.exists():
        print("corpus not found; building it...")
        sys.path.insert(0, str(_REPO_ROOT / "data"))
        import build_corpus  # type: ignore

        build_corpus.main()

    text = DATA.read_text(encoding="utf-8")
    tokenizer = CharTokenizer.from_text(text)
    tokenizer.save(TOK_PATH)

    data = torch.tensor(tokenizer.encode(text), dtype=torch.long)
    n = int(0.9 * len(data))
    train_data, val_data = data[:n], data[n:]
    print(f"corpus: {len(data):,} tokens | vocab: {tokenizer.vocab_size}")

    cfg = SolidLLMConfig(
        vocab_size=tokenizer.vocab_size,
        block_size=args.block_size,
        n_layer=args.n_layer,
        n_head=args.n_head,
        n_embd=args.n_embd,
    )
    model = SolidLLM(cfg)
    print(f"model: {model.num_params():,} parameters")

    opt = torch.optim.AdamW(model.parameters(), lr=args.lr)

    @torch.no_grad()
    def estimate_val_loss(iters: int = 20) -> float:
        model.eval()
        losses = []
        for _ in range(iters):
            xb, yb = get_batch(val_data, cfg.block_size, args.batch_size)
            _, loss = model(xb, yb)
            losses.append(loss.item())
        model.train()
        return sum(losses) / len(losses)

    print(f"training for {args.steps} steps...")
    t0 = time.time()
    model.train()
    for step in range(1, args.steps + 1):
        xb, yb = get_batch(train_data, cfg.block_size, args.batch_size)
        _, loss = model(xb, yb)
        opt.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        if step % 200 == 0 or step == 1:
            vl = estimate_val_loss()
            dt = time.time() - t0
            print(f"step {step:>5}/{args.steps} | train {loss.item():.3f} | val {vl:.3f} | {dt:.0f}s")

    torch.save(model.state_dict(), CKPT)
    CFG_PATH.write_text(json.dumps(cfg.to_dict(), indent=2), encoding="utf-8")
    print(f"\nsaved: {CKPT.name}, {TOK_PATH.name}, {CFG_PATH.name}")

    # sample generation
    print("\n--- sample generation ---")
    prompt = "Solid Solutions"
    idx = torch.tensor([tokenizer.encode(prompt)], dtype=torch.long)
    out = model.generate(idx, max_new_tokens=200, temperature=0.8, top_k=40)
    print(tokenizer.decode(out[0].tolist()))


if __name__ == "__main__":
    main()
