from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from inference.solid_llm import SolidLLM
import uvicorn

app = FastAPI(
    title="Solid LLM API",
    description="Our own LLM - Built by Solid Solutions",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = SolidLLM()

class GenerateRequest(BaseModel):
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 2048

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.get("/")
async def root():
    return {"message": "Solid LLM API - Powered by Solid Solutions"}

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "Solid LLM v1.0.0"}

@app.get("/model/info")
async def model_info():
    return llm.get_model_info()

@app.post("/generate")
async def generate(request: GenerateRequest):
    result = llm.generate(request.prompt, request.temperature, request.max_tokens)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@app.post("/chat")
async def chat(request: ChatRequest):
    messages = [msg.model_dump() for msg in request.messages]
    result = llm.chat(messages)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
