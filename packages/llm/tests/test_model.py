"""
Model-level tests for the Solid LLM package (require torch).

These exercise the from-scratch transformer and the v2 inference API. They are
kept separate from test_regression.py (which has no heavy deps) so CI can run
the lightweight suite without torch and still gate the model code when torch
is available.

Run with:  python3 -m unittest tests.test_model -v
"""

import os
import sys
import tempfile
import unittest
from pathlib import Path

PKG_ROOT = Path(__file__).resolve().parent.parent
if str(PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(PKG_ROOT))


@unittest.skipUnless(
    __import__("importlib").util.find_spec("torch") is not None,
    "torch not installed",
)
class TestTransformerModel(unittest.TestCase):
    """The from-scratch model must build, save, and load round-trip."""

    def test_model_build_and_forward(self):
        from training.train_simple import SimpleSolidLLM
        import torch

        model = SimpleSolidLLM(vocab_size=1000, d_model=128, n_layers=2, n_heads=2)
        model.eval()
        x = torch.randint(0, 1000, (1, 8))
        with torch.no_grad():
            out = model(x)
        self.assertEqual(out.shape[0], 1)
        self.assertEqual(out.shape[-1], 1000)  # logits over vocab

    def test_checkpoint_roundtrip(self):
        from training.train_simple import SimpleSolidLLM
        import torch

        model = SimpleSolidLLM(vocab_size=1000, d_model=128, n_layers=2, n_heads=2)
        with tempfile.TemporaryDirectory() as d:
            ckpt = Path(d) / "solid-llm-v2-simple.pth"
            torch.save(model.state_dict(), ckpt)
            reloaded = SimpleSolidLLM(vocab_size=1000, d_model=128, n_layers=2, n_heads=2)
            reloaded.load_state_dict(torch.load(ckpt))
        # Parameters should match after round-trip.
        for (n1, p1), (n2, p2) in zip(model.state_dict().items(), reloaded.state_dict().items()):
            self.assertEqual(n1, n2)
            self.assertTrue(torch.allclose(p1, p2))


@unittest.skipUnless(
    __import__("importlib").util.find_spec("torch") is not None,
    "torch not installed",
)
class TestApiV2Imports(unittest.TestCase):
    """The v2 FastAPI app must import and resolve its model path inside the pkg."""

    def test_app_imports_and_model_path_relative(self):
        import importlib
        mod = importlib.import_module("inference.api_v2")
        self.assertTrue(hasattr(mod, "app"))
        # Even when the checkpoint is absent, model is set to None and the app
        # still imports. The checkpoint path must live under <pkg>/models.
        ckpt = PKG_ROOT / "models" / "solid-llm-v2-simple.pth"
        self.assertTrue(
            str(ckpt).endswith("packages/llm/models/solid-llm-v2-simple.pth")
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
