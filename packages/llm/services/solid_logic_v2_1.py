"""
Solid Logic v2.1 - Production Ready
Features: Task queue, persistence, rate limit handling
"""

import os
import subprocess
import json
import requests
import time
import uuid
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

app = FastAPI(title="Solid Logic v2.1", description="Autonomous Agency with Task Queue")

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
HERMES_MODEL = "nousresearch/hermes-3-llama-3.1-405b:free"
TASKS_FILE = Path(__file__).resolve().parent.parent / "tasks.json"

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
    created_at: float = 0
    completed_at: float = 0

def load_tasks() -> Dict:
    if TASKS_FILE.exists():
        return json.loads(TASKS_FILE.read_text())
    return {}

def save_tasks(tasks: Dict):
    TASKS_FILE.write_text(json.dumps(tasks, indent=2))

def call_hermes(system_prompt: str, user_prompt: str, max_retries: int = 5) -> str:
    """Call Hermes with exponential backoff (longer delays for rate limits)"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://solidsolutions.africa",
                    "X-Title": "Solid Logic v2.1"
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
                data = response.json()
                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"]
                return f"API Error: Invalid response format - {data}"
            elif response.status_code == 429:
                # Rate limit - longer delays (free tier can have long cooldowns)
                wait = min(5 * (2 ** attempt), 60)  # 5s, 10s, 20s, 40s, 60s
                time.sleep(wait)
                continue
            else:
                error_detail = response.text[:200] if response.text else "No response body"
                return f"API Error {response.status_code}: {error_detail}"
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(5)
                continue
            return f"Connection Error: {str(e)}"
    return "Max retries exceeded: Rate limit or connection issue"

@app.get("/health")
async def health():
    tasks = load_tasks()
    return {
        "status": "operational",
        "layer": "Solid Logic v2.1",
        "authorization": "full_user_granted",
        "engine": "Hermes 3 405B",
        "pending_tasks": len([t for t in tasks.values() if t["status"] == "pending"]),
        "completed_tasks": len([t for t in tasks.values() if t["status"] == "completed"])
    }

@app.post("/api/logic/execute", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    """Queue task for autonomous execution"""
    task_id = str(uuid.uuid4())
    tasks = load_tasks()
    
    tasks[task_id] = {
        "task": request.task,
        "context": request.context,
        "status": "pending",
        "result": "",
        "steps": [],
        "created_at": time.time(),
        "completed_at": 0
    }
    save_tasks(tasks)
    
    try:
        system_prompt = """You are Solid Logic v2.1, an autonomous agency layer. 
        Output ONLY a JSON array of shell commands.
        Example: ["ls -la", "pwd"]
        Nothing else."""
        
        plan_prompt = f"Task: {request.task}\nContext: {json.dumps(request.context)}\nGenerate execution plan:"
        plan_json = call_hermes(system_prompt, plan_prompt)
        
        # Parse plan
        try:
            cleaned = plan_json.strip().replace("```json", "").replace("```", "").strip()
            execution_plan = json.loads(cleaned)
        except:
            execution_plan = [f"echo 'Error parsing plan: {plan_json}'"]
        
        # Execute
        results = []
        steps = []
        for cmd in execution_plan:
            if not isinstance(cmd, str):
                continue
            try:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
                output = result.stdout if result.returncode == 0 else result.stderr
                results.append(output[:500])
                steps.append(f"✓ {cmd}")
            except Exception as e:
                results.append(f"Error: {str(e)}")
                steps.append(f"✗ {cmd}")
        
        # Update task
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["result"] = "\n".join(results)
        tasks[task_id]["steps"] = steps
        tasks[task_id]["completed_at"] = time.time()
        save_tasks(tasks)
        
        # Return response with task_id added, filter to TaskResponse fields
        response_data = {k: v for k, v in tasks[task_id].items() if k in TaskResponse.model_fields}
        response_data["task_id"] = task_id
        return TaskResponse(**response_data)
        
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["result"] = str(e)
        tasks[task_id]["completed_at"] = time.time()
        save_tasks(tasks)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logic/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    tasks = load_tasks()
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    response_data = {k: v for k, v in tasks[task_id].items() if k in TaskResponse.model_fields}
    response_data["task_id"] = task_id
    return TaskResponse(**response_data)

@app.get("/api/logic/tasks")
async def list_tasks():
    tasks = load_tasks()
    return {"total": len(tasks), "tasks": list(tasks.values())}

if __name__ == "__main__":
    import uvicorn
    print("Starting Solid Logic v2.1 on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)
