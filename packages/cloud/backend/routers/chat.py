from fastapi import APIRouter
from services.ai_service import AIService

router = APIRouter(prefix="/api/chat", tags=["chat"])
ai_service = AIService()

@router.post("/query")
async def chat_query(request: dict):
    model = request.get("model", "anthropic/claude-sonnet-4")
    prompt = request.get("prompt", "")
    
    result = await ai_service.query_openrouter(model, prompt)
    return result

@router.get("/models")
async def get_models():
    return ai_service.get_available_models()
