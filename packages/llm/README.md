# Solid LLM

**Solid LLM** is a custom language-model project by [Solid Solutions](https://solidsolutions.africa). At its core is a genuine decoder-only transformer **built from scratch in PyTorch** with causal self-attention, a real character-level tokenizer, and an honest train→generate pipeline. The current public artefact is a small **character-level research preview** (~3.2M parameters) trained on a first-party Solid Solutions corpus — it produces coherent, on-topic English and is served over a FastAPI inference API.

> This is an honest research preview, not a large production model. It demonstrates the real training and inference pipeline end to end.

## Architecture

```
solid-llm/
├── data/               # Training data (first-party, no third-party text)
│   ├── knowledge.md    # Factual Solid Solutions knowledge base
│   ├── build_corpus.py # Generates data/corpus.txt from knowledge + templates
│   └── corpus.txt      # Built corpus (generated)
├── training/           # Model + training
│   ├── tokenizer.py    # Reversible character-level tokenizer
│   ├── model.py        # SolidLLM: decoder-only causal transformer (from scratch)
│   ├── train.py        # Training pipeline -> models/*.pth,tokenizer.json,config.json
│   └── solid_llm_model.py  # Larger reference architecture (config only)
├── inference/          # Inference
│   ├── engine.py       # Loads weights+tokenizer; honest generate()
│   ├── api_v2.py       # FastAPI server (port 8002) over the real model
│   ├── api_server.py   # v1 API (Ollama-backed, port 8001)
│   └── local_hermes.py # Optional local Hermes 3 inference (transformers)
├── services/           # Background/agency services (OpenRouter-backed)
│   ├── solid_logic.py
│   ├── solid_logic_v2.py
│   └── solid_logic_v2_1.py
├── models/             # Trained artefacts
│   ├── solid-llm-char.pth  # Shipped from-scratch checkpoint (~13MB)
│   ├── tokenizer.json      # Character vocabulary
│   └── config.json         # Model hyper-parameters
└── requirements.txt    # Python dependencies
```

## Train it yourself

```bash
python data/build_corpus.py      # build data/corpus.txt (first-party text)
python training/train.py         # ~a few minutes on CPU; writes models/*
```

## Run the inference API

```bash
uvicorn inference.api_v2:app --host 0.0.0.0 --port 8002
# quick local check:
python inference/engine.py

curl -X POST http://localhost:8002/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"SolidAI helps farmers","max_tokens":120,"temperature":0.7}'
```

## Quick Start

### Prerequisites

- Python 3.10+
- pip or uv package manager
- (Optional) Ollama for v1 inference
- (Optional) OpenRouter API key for cloud inference

### Installation

```bash
git clone https://github.com/YassinAliYassin/solid-llm.git
cd solid-llm
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running the APIs

**v1 API (Ollama-backed):**
```bash
python inference/api_server.py
# → http://localhost:8001
```

**v2 API (our from-scratch model):**
```bash
python inference/api_v2.py
# → http://localhost:8002  (serves models/solid-llm-char.pth)
```

**Solid Logic v2.1 (Autonomous Agency):**
```bash
export OPENROUTER_API_KEY="sk-or-..."
python services/solid_logic_v2_1.py
# → http://localhost:8002
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/model/info` | GET | Model metadata |
| `/generate` | POST | Text generation |
| `/chat` | POST | Chat completion (v1 only) |

### Example Request

```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, world!", "temperature": 0.7}'
```

## Training

Train the from-scratch character model (see "Train it yourself" above):

```bash
python data/build_corpus.py
python training/train.py --steps 2000
```

This creates a ~3.2M-parameter decoder-only transformer trained on a first-party
Solid Solutions corpus, and writes `models/solid-llm-char.pth`, `tokenizer.json`,
and `config.json`.

## Configuration

Set environment variables for API keys:

```bash
export OPENROUTER_API_KEY="sk-or-..."
```

> **Note:** Never commit API keys to version control. The `.gitignore` file excludes `.env` files.

## License

See [LICENSE](LICENSE) for details.
