import os
import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from services.ai_service import AIService

router = APIRouter(prefix="/api/chat", tags=["chat"])
ai_service = AIService()


def require_cloud_api_token(authorization: str | None = Header(default=None)) -> None:
    """Shared bearer token. Unset server config and a wrong token both reject the call."""
    expected = os.getenv("CLOUD_API_TOKEN", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="CLOUD_API_TOKEN is not configured")

    scheme, _, provided = (authorization or "").partition(" ")
    provided = provided.strip()
    if scheme.lower() != "bearer" or not provided or len(provided) != len(expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not secrets.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/query")
async def chat_query(request: dict, _: None = Depends(require_cloud_api_token)):
    model = request.get("model", "anthropic/claude-sonnet-4")
    prompt = request.get("prompt", "")

    result = await ai_service.query_openrouter(model, prompt)
    return result


@router.get("/models")
async def get_models():
    return ai_service.get_available_models()
