from fastapi import APIRouter
import subprocess
import shutil
from typing import Dict, Any

router = APIRouter(prefix="/api/hermes", tags=["hermes"])

def _hermes_bin() -> str:
    # Prefer a hermes on PATH; fall back to the local venv install.
    return shutil.which("hermes") or "/home/yassin/.hermes/hermes-agent/venv/bin/hermes"

@router.post("/query")
async def hermes_query(request: dict):
    prompt = request.get("prompt", "")

    try:
        result = subprocess.run(
            [_hermes_bin(), "chat", "-q", prompt],
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
