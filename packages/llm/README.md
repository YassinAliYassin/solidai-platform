# Solid LLM

**Solid LLM** is a custom Large Language Model project by [Solid Solutions](https://solidsolutions.africa). It features a transformer model built from scratch in PyTorch, multiple inference APIs, and an autonomous agency layer.

## Architecture

```
solid-llm/
├── inference/          # Inference engines
│   ├── api_server.py   # v1 API (Ollama-backed, port 8001)
│   ├── api_v2.py       # v2 API (PyTorch model + Hermes, port 8002)
│   ├── solid_llm.py    # Core LLM wrapper (Ollama subprocess)
│   └── local_hermes.py # Local Hermes 3 inference (transformers)
├── training/           # Training scripts
│   ├── solid_llm_model.py  # Transformer model definition
│   ├── train.py        # Full training pipeline
│   └── train_simple.py # Simplified training (719K param model)
├── services/           # Background services
│   ├── solid_logic.py      # v1: Autonomous agency (local Hermes)
│   ├── solid_logic_v2.py   # v2: OpenRouter-backed agency
│   └── solid_logic_v2_1.py # v2.1: Production agency with task queue
├── web/                # Web frontend
│   ├── api.php         # Cloud API (OpenRouter via PHP)
│   ├── api-v2.php      # v2 API with Hermes enhancement
│   └── index.html      # Landing page
├── cgi-bin/            # CGI deployment scripts
│   └── solid-llm.cgi   # cPanel CGI interface
├── models/             # Trained model weights
│   └── solid-llm-v2-simple.pth
└── requirements.txt    # Python dependencies
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

**v2 API (PyTorch model + Hermes):**
```bash
python inference/api_v2.py
# → http://localhost:8002
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

Train the simple model from scratch:

```bash
cd training
python train_simple.py
```

This creates a 719K-parameter transformer trained on a custom dataset.

## Configuration

Set environment variables for API keys:

```bash
export OPENROUTER_API_KEY="sk-or-..."
```

> **Note:** Never commit API keys to version control. The `.gitignore` file excludes `.env` files.

## License

See [LICENSE](LICENSE) for details.
