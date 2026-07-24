"""
Solid LLM - Inference API (FastAPI).

Serves the real, from-scratch character-level model over HTTP. Every response is
produced by the trained weights via the honest pipeline in inference/engine.py:

    prompt -> tokenizer.encode -> model.generate -> tokenizer.decode -> text

Run:
    uvicorn inference.api_v2:app --host 0.0.0.0 --port 8002
    # or: python inference/api_v2.py

Endpoints:
    GET  /            service info
    GET  /health      health + model-loaded flag
    GET  /model/info  real model metadata
    POST /generate    { prompt, max_tokens?, temperature?, top_k? } -> text
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference.engine import get_engine, SolidLLMEngine

app = FastAPI(
    title="Solid LLM API",
    description="Solid Solutions' from-scratch character-level language model.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Load the model once at startup. If the checkpoint is missing we keep the API
# up but report model_loaded=False instead of pretending to work.
_engine: SolidLLMEngine | None = None
_load_error: str | None = None
try:
    _engine = get_engine()
    print(f"Solid LLM loaded: {_engine.num_params:,} params, vocab {_engine.tokenizer.vocab_size}")
except Exception as exc:  # noqa: BLE001
    _load_error = str(exc)
    print(f"Solid LLM NOT loaded: {exc}")


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    max_tokens: int = Field(200, ge=1, le=1000)
    temperature: float = Field(0.8, ge=0.0, le=2.0)
    top_k: int = Field(40, ge=0, le=1000)


@app.get("/")
async def root():
    return {
        "name": "Solid LLM",
        "description": "From-scratch character-level transformer by Solid Solutions",
        "note": "Small research-preview model. Real weights, real generation.",
        "built_by": "Solid Solutions",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": _engine is not None, "error": _load_error}


@app.get("/model/info")
async def model_info():
    if _engine is None:
        raise HTTPException(status_code=503, detail=f"model not loaded: {_load_error}")
    cfg = _engine.config
    return {
        "name": "Solid LLM (char-level research preview)",
        "version": "3.0.0",
        "architecture": "Decoder-only transformer (causal self-attention), built from scratch in PyTorch",
        "parameters": _engine.num_params,
        "vocab_size": _engine.tokenizer.vocab_size,
        "context_length": cfg.block_size,
        "n_layer": cfg.n_layer,
        "n_head": cfg.n_head,
        "n_embd": cfg.n_embd,
        "tokenizer": "character-level",
        "training_data": "first-party Solid Solutions corpus",
        "built_by": "Solid Solutions",
    }


@app.post("/generate")
async def generate(request: GenerateRequest):
    if _engine is None:
        raise HTTPException(status_code=503, detail=f"model not loaded: {_load_error}")
    try:
        completion = _engine.generate(
            request.prompt,
            max_new_tokens=request.max_tokens,
            temperature=request.temperature,
            top_k=request.top_k if request.top_k > 0 else None,
        )
        return {
            "model": "Solid LLM (char-level research preview)",
            "prompt": request.prompt,
            "completion": completion,
            "text": request.prompt + completion,
            "built_by": "Solid Solutions",
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    print("\n" + "=" * 60)
    print("Solid LLM API - from-scratch model by Solid Solutions")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8002)
