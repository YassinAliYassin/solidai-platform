import os
from typing import Dict, List, Any

class AIService:
    def __init__(self):
        self.providers = {
            "openrouter": os.getenv("OPENROUTER_API_KEY"),
            "ollama": "http://localhost:11434"
        }
        
    def get_available_models(self) -> List[Dict[str, Any]]:
        return [
            {"id": "anthropic/claude-sonnet-4", "name": "Claude Sonnet 4", "provider": "openrouter"},
            {"id": "openai/gpt-4o", "name": "GPT-4o", "provider": "openrouter"},
            {"id": "google/gemini-pro-1.5", "name": "Gemini Pro 1.5", "provider": "openrouter"},
            {"id": "xai/grok-2", "name": "Grok 2", "provider": "openrouter"},
            {"id": "llama3.1:8b", "name": "Llama 3.1 8B (Local)", "provider": "ollama"},
        ]
    
    async def query_openrouter(self, model: str, prompt: str) -> Dict[str, Any]:
        """Query OpenRouter API"""
        import openai
        
        client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.providers["openrouter"]
        )
        
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return {
            "model": model,
            "response": response.choices[0].message.content,
            "provider": "openrouter"
        }
