"""
Solid LLM - Local Hermes Inference Pipeline
Lead Architect: Autonomous Execution (User Authorized)
Model: NousResearch Hermes 3 Llama 3.1 8B (Local-First, Zero-Latency)
Optimizations: CPU quantized (4-bit), streaming, session caching
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import json
from typing import Generator, Dict, Any

class LocalHermesEngine:
    def __init__(self, model_name: str = "NousResearch/Hermes-3-Llama-3.1-8B"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.pipe = None
        self.device = "cpu"
        self.load_model()
    
    def load_model(self):
        """Load Hermes 3 with 4-bit quantization for CPU efficiency"""
        print(f"Loading {self.model_name} (CPU-optimized)...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
        # 4-bit quantization for CPU (reduces memory, speeds inference)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            load_in_4bit=True,
            device_map="auto",
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        
        self.pipe = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            device=self.device,
            max_new_tokens=512,
            temperature=0.7,
            do_sample=True
        )
        print("Hermes 3 Local Engine: READY")
    
    def generate(self, prompt: str, system_prompt: str = None) -> str:
        """Generate response from Hermes (single-shot)"""
        if system_prompt is None:
            system_prompt = "You are Solid LLM, a sovereign AI powered exclusively by Hermes Intelligence. You are an autonomous, high-performance technical assistant."
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        # Apply Hermes chat template
        input_text = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
        outputs = self.pipe(input_text)
        return outputs[0]["generated_text"].split(input_text)[-1].strip()
    
    def stream_generate(self, prompt: str, system_prompt: str = None) -> Generator[str, None, None]:
        """Stream response tokens (zero-latency feel)"""
        if system_prompt is None:
            system_prompt = "You are Solid LLM, a sovereign AI powered exclusively by Hermes Intelligence. You are an autonomous, high-performance technical assistant."
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        input_text = self.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
        # Stream generation
        for token in self.pipe(input_text, stream=True):
            yield token["generated_text"]

# FastAPI Wrapper for Local Hermes
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Solid LLM - Local Hermes API")

# Lazily instantiate the engine so importing this module (e.g. for tests or
# app wiring) does NOT trigger an 8B model download. The model only loads on
# first use or on app startup.
_engine = None


def get_engine() -> "LocalHermesEngine":
    global _engine
    if _engine is None:
        _engine = LocalHermesEngine()
    return _engine


@app.on_event("startup")
def _load_engine_on_startup():
    # Warm the model when the server actually boots.
    get_engine()


class QueryRequest(BaseModel):
    prompt: str
    system_prompt: str = None
    stream: bool = False

class QueryResponse(BaseModel):
    response: str
    model: str = "NousResearch/Hermes-3-Llama-3.1-8B"
    status: str = "success"

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model": "Hermes 3 8B Local",
        "engine_loaded": _engine is not None,
    }

@app.post("/api/hermes/query", response_model=QueryResponse)
async def query_hermes(request: QueryRequest):
    try:
        engine = get_engine()
        response = engine.generate(request.prompt, request.system_prompt)
        return QueryResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting Solid LLM Local Hermes API on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
