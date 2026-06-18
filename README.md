# Solid LLM

Solid LLM is a modular AI platform that binds together a local Hermes-powered inference engine, a remote OpenRouter-based API gateway, and a set of PHP/Python services for deployment on a variety of hosts.

## Project Structure
```
├── services
│   ├── solid_logic_v2.py          # FastAPI wrapper around OpenRouter
│   ├── solid_logic.py             # Light‐weight local Hermes wrapper
│   └── solid_logic_v2_1.py        # Production‑ready version with persistence
├── inference
│   ├── api_server.py              # FastAPI local endpoint for local Hermes
│   ├── api_v2.py                  # Alternative local API
│   ├── local_hermes.py            # Local Hermes engine + FastAPI
│   └── solid_llm.py               # Core CLI wrapper
├── training
│   ├── train_simple.py           # Minimal training script
│   └── solid_llm_model.py        # Toy transformer used for training
├── web
│   └── api.php                    # PHP wrapper around OpenRouter
├── cgi-bin
│   └── solid-llm.cgi              # CG It wrapper
├── models                            # Embedded/model weights
└── .env.example                    # Example configuration
```

## Getting Started
1. Create a Python 3.11 environment and install dependencies from `requirements.txt` (generated via `pipenv lock`).
2. Copy `.env.example` to `.env` and populate the `OPENROUTER_API_KEY` and `HERMES_MODEL` values.
3. Run the local service:
   ```bash
   uvicorn inference.local_hermes:app --reload
   ```
4. Or run the PHP API locally via a web server.

## Deployment
For a containerised deployment the `web/api.php` script exposes a single `/generate` endpoint that proxies requests to OpenRouter. It is suitable for cPanel or any PHP host.

## Testing
Run the included test suite:
```bash
pytest -q
```

## Utilities
* `services/solid_logic_v2.py`: FastAPI app that forwards tasks to OpenRouter and executes the generated plan.
* `services/solid_logic_v2_1.py`: Adds persistent task queue and better rate‑limit handling.
* `inference/api_server.py`: FastAPI endpoint exposing the local Hermes inference model.
* `training/train_simple.py`: A minimal training script that trains a toy transformer.

## Extending
Add new OpenAI engines by updating the `HERMES_MODEL` value in `.env`. New services can be added under `services/` and registered in the FastAPI router.

## Contributing
Feel free to fork, test, or create pull requests. Make sure to update tests and documentation accordingly.

---

© Solid Solutions 2026. All rights reserved.
