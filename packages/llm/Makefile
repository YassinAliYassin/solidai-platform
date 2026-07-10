# Solid LLM - test runner
# Dependency-free: uses the stdlib unittest discover.
#
# Usage:
#   make test            # run all tests if torch+transformers are installed
#   make test-light      # run only the fast regression suite (no torch needed)
#   make test-venv VENV=...  # run inside a specific venv (e.g. a CPU-torch venv)

PY ?= python3
TESTS := tests

.PHONY: test test-light

test:
	$(PY) -m unittest discover -s $(TESTS) -v

# The regression suite has no heavy deps (only fastapi/requests) and guards
# against import-time crashes + leftover hardcoded monorepo paths.
test-light:
	$(PY) -m unittest tests.test_regression -v
