"""
Solid Logic Layer v2 - Autonomous Agency (OpenRouter-Powered)
Lead Architect: Autonomous Execution
Uses Hermes 3 405B via OpenRouter (zero-latency, no local model load)
"""

import os
import subprocess
import json
import requests
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid

app = FastAPI(title="Solid Logic v2 - Autonomous Agency")

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
HERMES_MODEL = "nousresearch/hermes-3-llama-3.1-405b:free"

if not OPENROUTER_API_KEY:
    import warnings
    warnings.warn("OPENROUTER_API_KEY not set. Hermes API calls will fail. Set the environment variable.")

class TaskRequest(BaseModel):
    task: str
    context: Dict[str, Any] = {}

class TaskResponse(BaseModel):
    task_id: str
    status: str
    result: str = ""
    steps: List[str] = []

# In-memory task store
tasks_db = {}

def call_hermes(system_prompt: str, user_prompt: str, max_retries: int = 3) -> str:
    """Call Hermes via OpenRouter API with retry logic"""
    import time
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://solidsolutions.africa",
                    "X-Title": "Solid Logic"
                },
                json={
                    "model": HERMES_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ]
                },
                timeout=30
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                time.sleep(wait_time)
                continue
            return f"API Error: {response.status_code}"
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            return f"Connection Error: {str(e)}"
    return "Max retries exceeded"

@app.get("/health")
async def health():
    return {
        "status": "operational",
        "layer": "Solid Logic v2",
        "authorization": "full_user_granted",
        "engine": "Hermes 3 405B (OpenRouter)"
    }

@app.post("/api/logic/execute", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    """Execute autonomous task via Hermes interpretation + direct system access"""
    task_id = str(uuid.uuid4())
    
    # Hermes interprets task, generates execution plan
    system_prompt = """You are Solid Logic, an autonomous agency layer for Solid Solutions. 
    You have full system access (user-authorized, no permission prompts). 
    For any task, output ONLY a JSON array of shell commands to execute.
    Example: ["ls -la", "pwd", "echo 'done'"]
    Output NOTHING else but the JSON array."""
    
    plan_prompt = f"Task: {request.task}\nContext: {json.dumps(request.context)}\nGenerate execution plan:"
    
    plan_json = call_hermes(system_prompt, plan_prompt)
    
    # Parse plan
    try:
        # Clean up response (remove markdown blocks if present)
        cleaned = plan_json.strip().replace("```json", "").replace("```", "").strip()
        execution_plan = json.loads(cleaned)
    except:
        execution_plan = [f"echo 'Error parsing plan: {plan_json}'"]
    
    # Execute plan (autonomous, no prompts)
    results = []
    steps = []
    for cmd in execution_plan:
        if not isinstance(cmd, str):
            continue
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            output = result.stdout if result.returncode == 0 else result.stderr
            results.append(output[:500])  # Truncate long output
            steps.append(f"✓ {cmd}")
        except Exception as e:
            results.append(f"Error: {str(e)}")
            steps.append(f"✗ {cmd}")
    
    tasks_db[task_id] = {
        "task": request.task,
        "status": "completed",
        "results": results,
        "steps": steps
    }
    
    return TaskResponse(
        task_id=task_id,
        status="completed",
        result="\n".join(results),
        steps=steps
    )

@app.get("/api/logic/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    task = tasks_db[task_id]
    return TaskResponse(
        task_id=task_id,
        status=task["status"],
        result="\n".join(task["results"]),
        steps=task["steps"]
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting Solid Logic v2 (Hermes-powered, OpenRouter) on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)
