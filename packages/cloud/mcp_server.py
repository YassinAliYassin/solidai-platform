#!/usr/bin/env python3
"""
Solid Cloud MCP Server
Exposes Solid Cloud AI Hub tools to AionUI via Model Context Protocol
"""

import asyncio
import json
import httpx
from typing import Any, Sequence
from mcp.server import Server
from mcp.types import Tool, TextContent
import mcp.server.stdio

app = Server("solid-cloud")

SOLID_CLOUD_URL = "http://localhost:8000"

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="solid_cloud_chat",
            description="Query Solid Cloud AI chat with any model via OpenRouter",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {"type": "string", "description": "The prompt to send"},
                    "model": {"type": "string", "description": "Model to use (default: anthropic/claude-sonnet-4)"}
                },
                "required": ["prompt"]
            }
        ),
        Tool(
            name="solid_cloud_list_models",
            description="Get available AI models from Solid Cloud",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="solid_cloud_hermes_query",
            description="Query Hermes Agent through Solid Cloud integration",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {"type": "string", "description": "The prompt for Hermes Agent"}
                },
                "required": ["prompt"]
            }
        ),
        Tool(
            name="solid_cloud_status",
            description="Check Solid Cloud service health status",
            inputSchema={"type": "object", "properties": {}}
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> Sequence[TextContent]:
    async with httpx.AsyncClient(base_url=SOLID_CLOUD_URL, timeout=120.0) as client:
        
        if name == "solid_cloud_chat":
            prompt = arguments.get("prompt")
            model = arguments.get("model", "anthropic/claude-sonnet-4")
            resp = await client.post("/api/chat/query", json={"prompt": prompt, "model": model})
            return [TextContent(type="text", text=json.dumps(resp.json(), indent=2))]
        
        elif name == "solid_cloud_list_models":
            resp = await client.get("/api/chat/models")
            return [TextContent(type="text", text=json.dumps(resp.json(), indent=2))]
        
        elif name == "solid_cloud_hermes_query":
            prompt = arguments.get("prompt")
            resp = await client.post("/api/hermes/query", json={"prompt": prompt})
            return [TextContent(type="text", text=json.dumps(resp.json(), indent=2))]
        
        elif name == "solid_cloud_status":
            resp = await client.get("/health")
            return [TextContent(type="text", text=json.dumps(resp.json(), indent=2))]
        
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
