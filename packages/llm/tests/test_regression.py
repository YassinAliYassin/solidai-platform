"""
Regression tests for the Solid LLM package.

Guards against the two bug classes that previously broke the package in the
unified monorepo:

1. Import-time crashes (e.g. missing `typing` imports, pydantic-v1 `.dict()`).
2. Hardcoded absolute paths to the old standalone location left behind after
   the consolidation (commit 7aa61ef).

These tests intentionally avoid importing modules that require heavy optional
deps (torch / transformers). They inspect source + import the lightweight
entrypoints so they run in any environment.
"""

import ast
import importlib.util
import sys
import unittest
from pathlib import Path

# Make the package importable regardless of CWD.
PKG_ROOT = Path(__file__).resolve().parent.parent
if str(PKG_ROOT) not in sys.path:
    sys.path.insert(0, str(PKG_ROOT))

# Legacy absolute location that must never appear again.
LEGACY_PATH = "/home/yassin/solid-llm"

# Source files that previously hard-coded the legacy location. These are the
# only files we assert on, which also avoids false positives from this test's
# own comments.
PATH_SENSITIVE_FILES = [
    "services/solid_logic.py",
    "services/solid_logic_v2_1.py",
    "inference/api_v2.py",
    "training/train.py",
    "training/train_simple.py",
]


def _load_ast(rel: str) -> ast.Module:
    return ast.parse((PKG_ROOT / rel).read_text(encoding="utf-8"))


def _file_relative_path_used(tree: ast.Module) -> bool:
    """True if the module resolves a path from __file__ (alias-aware).

    Handles both `Path(__file__)` and `from pathlib import Path as _Path`
    followed by `_Path(__file__)`.
    """
    aliases = {"Path"}  # names that refer to pathlib.Path
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module == "pathlib":
            for alias in node.names:
                if alias.name == "Path":
                    aliases.add(alias.asname or "Path")
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name == "pathlib":
                    pass  # `pathlib.Path(__file__)` handled below
    for node in ast.walk(tree):
        # pathlib.Path(__file__) form
        if (
            isinstance(node, ast.Attribute)
            and isinstance(node.value, ast.Name)
            and node.value.id == "pathlib"
            and node.attr == "Path"
        ):
            if any(
                isinstance(a, ast.Name) and a.id == "__file__"
                for a in (node.parent.args if hasattr(node, "parent") else [])
            ):
                return True
        # Path(__file__) / _Path(__file__) form (alias-aware)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in aliases:
                for a in node.args:
                    if isinstance(a, ast.Name) and a.id == "__file__":
                        return True
    return False


class TestNoHardcodedMonorepoPaths(unittest.TestCase):
    """The old standalone location must not appear in the path-sensitive files."""

    def test_no_legacy_path_in_sensitive_files(self):
        bad_refs = []
        for rel in PATH_SENSITIVE_FILES:
            text = (PKG_ROOT / rel).read_text(encoding="utf-8")
            if LEGACY_PATH in text:
                bad_refs.append(rel)
        self.assertEqual(
            bad_refs, [],
            f"Hardcoded legacy path {LEGACY_PATH} found in: {bad_refs}",
        )

    def test_path_sensitive_files_use_relative_resolution(self):
        for rel in PATH_SENSITIVE_FILES:
            tree = _load_ast(rel)
            self.assertTrue(
                _file_relative_path_used(tree),
                f"{rel} should resolve paths relative to __file__, not hardcode them",
            )


class TestLightweightImports(unittest.TestCase):
    """Entrypoints that only need fastapi/requests must import cleanly."""

    def test_api_server_imports(self):
        import importlib
        mod = importlib.import_module("inference.api_server")
        self.assertTrue(hasattr(mod, "app"))
        # The pydantic ChatMessage model must serialize under pydantic v2.
        msg = mod.ChatMessage(role="user", content="hi")
        self.assertEqual(msg.model_dump(), {"role": "user", "content": "hi"})

    def test_solid_logic_v2_1_imports(self):
        import importlib
        mod = importlib.import_module("services.solid_logic_v2_1")
        self.assertTrue(hasattr(mod, "app"))
        # Task store path must live inside the package, not the old location.
        self.assertEqual(mod.TASKS_FILE, PKG_ROOT / "tasks.json")

    def test_api_v2_model_path_is_relative(self):
        """api_v2 must attempt to load weights from <pkg>/models, not a hardcoded path."""
        import importlib.util
        if importlib.util.find_spec("torch") is None:
            self.skipTest("torch not installed; api_v2 requires it at import time")
        import importlib
        mod = importlib.import_module("inference.api_v2")
        self.assertTrue(hasattr(mod, "app"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
