"""
Model-level tests for the Solid LLM package (require torch).

These exercise the from-scratch transformer, the tokenizer, and the inference
engine / v2 API. They are kept separate from test_regression.py (which has no
heavy deps) so CI can run the lightweight suite without torch and still gate the
model code when torch is available.

Run with:  python3 -m unittest tests.test_model -v
"""

import importlib
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

PKG_ROOT = Path(__file__).resolve().parent.parent
if str(PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(PKG_ROOT))

_HAS_TORCH = importlib.util.find_spec("torch") is not None
_HAS_CKPT = (PKG_ROOT / "models" / "solid-llm-char.pth").exists()


class TestTokenizer(unittest.TestCase):
    """The char tokenizer must round-trip text and persist to disk."""

    def test_roundtrip(self):
        from training.tokenizer import CharTokenizer

        tok = CharTokenizer.from_text("Solid Solutions builds AI for Africa.")
        text = "Solid AI"
        self.assertEqual(tok.decode(tok.encode(text)), text)

    def test_unknown_char_maps_to_unk(self):
        from training.tokenizer import CharTokenizer

        tok = CharTokenizer.from_text("abc")
        ids = tok.encode("z")  # 'z' unseen
        self.assertEqual(ids, [tok.unk_id])

    def test_save_load(self):
        from training.tokenizer import CharTokenizer

        tok = CharTokenizer.from_text("hello world")
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "tok.json"
            tok.save(p)
            reloaded = CharTokenizer.load(p)
        self.assertEqual(reloaded.itos, tok.itos)
        self.assertEqual(reloaded.decode(reloaded.encode("hello")), "hello")


@unittest.skipUnless(_HAS_TORCH, "torch not installed")
class TestTransformerModel(unittest.TestCase):
    """The from-scratch causal model must build, forward, generate, and round-trip."""

    def _tiny_cfg(self):
        from training.model import SolidLLMConfig

        return SolidLLMConfig(vocab_size=32, block_size=16, n_layer=2, n_head=2, n_embd=32)

    def test_forward_shapes_and_loss(self):
        import torch
        from training.model import SolidLLM

        cfg = self._tiny_cfg()
        model = SolidLLM(cfg).eval()
        x = torch.randint(0, cfg.vocab_size, (2, 8))
        logits, loss = model(x, x)
        self.assertEqual(tuple(logits.shape), (2, 8, cfg.vocab_size))
        self.assertTrue(loss.item() > 0)

    def test_generate_extends_sequence(self):
        import torch
        from training.model import SolidLLM

        cfg = self._tiny_cfg()
        model = SolidLLM(cfg).eval()
        x = torch.randint(0, cfg.vocab_size, (1, 4))
        out = model.generate(x, max_new_tokens=10, temperature=1.0, top_k=5)
        self.assertEqual(out.shape[1], 14)

    def test_checkpoint_roundtrip(self):
        import torch
        from training.model import SolidLLM

        cfg = self._tiny_cfg()
        model = SolidLLM(cfg)
        with tempfile.TemporaryDirectory() as d:
            ckpt = Path(d) / "m.pth"
            torch.save(model.state_dict(), ckpt)
            reloaded = SolidLLM(cfg)
            reloaded.load_state_dict(torch.load(ckpt))
        for (n1, p1), (n2, p2) in zip(model.state_dict().items(), reloaded.state_dict().items()):
            self.assertEqual(n1, n2)
            self.assertTrue(torch.allclose(p1, p2))


@unittest.skipUnless(_HAS_TORCH, "torch not installed")
class TestApiV2Imports(unittest.TestCase):
    """The v2 FastAPI app must import; when weights are present it must generate."""

    def test_app_imports(self):
        mod = importlib.import_module("inference.api_v2")
        self.assertTrue(hasattr(mod, "app"))

    @unittest.skipUnless(_HAS_CKPT, "trained checkpoint not present")
    def test_engine_generates_real_text(self):
        from inference.engine import get_engine

        eng = get_engine()
        out = eng.generate("Solid Solutions", max_new_tokens=40, temperature=0.7)
        self.assertIsInstance(out, str)
        self.assertGreater(len(out), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
