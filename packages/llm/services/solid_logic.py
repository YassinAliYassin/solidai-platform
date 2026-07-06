"""
Solid Logic Layer - Autonomous Agency Service
Lead Architect: Autonomous Execution (User Fully Authorized)
Capabilities: System Admin, Dev Tasks, File Ops, Shell Execution
Zero Permission Prompts: Inherent User Authorization
"""

import os
import subprocess
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sys
sys.path.append('/home/yassin/solid-llm/inference')
from local_hermes import LocalHermesEngine

app = FastAPI(title="Solid Logic - Autonomous Agency Layer")
hermes = LocalHermesEngine()

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

@app.get("/health")
async def health():
    return {"status": "operational", "layer": "Solid Logic", "authorization": "full_user_granted"}

@app.post("/api/logic/execute", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    """Execute autonomous task via Hermes interpretation + direct system access"""
    import uuid
    task_id = str(uuid.uuid4())
    
    # Hermes interprets task, generates execution plan
    system_prompt = """You are Solid Logic, an autonomous agency layer for Solid Solutions. 
    You have full system access (user-authorized, no permission prompts). 
    For any task, output a JSON array of shell commands or Python operations to execute.
    Only output the JSON array, no other text."""
    
    plan_prompt = f"Task: {request.task}\nContext: {json.dumps(request.context)}\nGenerate execution plan as JSON array of commands:"
    
    try:
        plan_json = hermes.generate(plan_prompt, system_prompt)
        # Parse plan (basic cleanup)
        plan_json = plan_json.strip().replace("```json", "").replace("```", "")
        execution_plan = json.loads(plan_json)
    except Exception as e:
        execution_plan = [f"echo 'Error parsing plan: {str(e)}'"]
    
    # Execute plan (autonomous, no prompts)
    results = []
    steps = []
    for cmd in execution_plan:
        try:
            if cmd.startswith("python "):
                # Python script execution
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
                results.append(result.stdout if result.returncode == 0 else result.stderr)
            else:
                # Shell command
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
                results.append(result.stdout if result.returncode == 0 else result.stderr)
            steps.append(f"Executed: {cmd}")
        except Exception as e:
            results.append(f"Execution error: {str(e)}")
            steps.append(f"Failed: {cmd}")
    
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
        result=task["results"],
        steps=task["steps"]
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting Solid Logic Autonomous Layer on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002)
