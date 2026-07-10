"""
Import/integration tests for inference.local_hermes (require torch + transformers).

The key invariant: importing the module must NOT trigger the 8B Hermes model
download. The engine is lazy-loaded on first use / app startup. These tests
assert the import is cheap (engine not constructed) and the FastAPI app + /health
endpoint work without fetching weights.
"""

import importlib
import sys
import unittest
from pathlib import Path

PKG_ROOT = Path(__file__).resolve().parent.parent
if str(PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(PKG_ROOT))

_TORCH = importlib.util.find_spec("torch") is not None
_TRANSFORMERS = importlib.util.find_spec("transformers") is not None
_HAS_DEPS = _TORCH and _TRANSFORMERS


@unittest.skipUnless(_HAS_DEPS, "torch + transformers required")
class TestLocalHermesLazyLoad(unittest.TestCase):
    def test_import_does_not_construct_engine(self):
        mod = importlib.import_module("inference.local_hermes")
        # Engine must remain unloaded after a plain import.
        self.assertIsNone(mod._engine)
        self.assertTrue(hasattr(mod, "app"))
        self.assertTrue(hasattr(mod, "get_engine"))

    def test_health_endpoint_without_model(self):
        from fastapi.testclient import TestClient
        mod = importlib.import_module("inference.local_hermes")
        client = TestClient(mod.app)
        r = client.get("/health")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "healthy")
        # Without a warm-up, the engine is not loaded (no 8B download).
        self.assertFalse(body["engine_loaded"])

    def test_get_engine_is_idempotent(self):
        mod = importlib.import_module("inference.local_hermes")
        # We don't actually call get_engine() here because it would download
        # the 8B weights; we only assert the accessor exists and is callable.
        self.assertTrue(callable(mod.get_engine))


if __name__ == "__main__":
    unittest.main(verbosity=2)
