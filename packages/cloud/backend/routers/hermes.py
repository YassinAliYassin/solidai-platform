from fastapi import APIRouter
import subprocess
from typing import Dict, Any

router = APIRouter(prefix="/api/hermes", tags=["hermes"])

@router.post("/query")
async def hermes_query(request: dict):
    prompt = request.get("prompt", "")
    
    try:
        result = subprocess.run(
            ["/home/yassin/.hermes/hermes-agent/venv/bin/hermes", "chat", "-q", prompt],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        return {
            "success": result.returncode == 0,
            "response": result.stdout,
            "error": result.stderr if result.returncode != 0 else None
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
