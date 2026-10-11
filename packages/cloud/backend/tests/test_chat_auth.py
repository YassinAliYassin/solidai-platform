"""Auth and CORS behavior for POST /api/chat/query."""

import os
import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app  # noqa: E402
from routers import chat  # noqa: E402


class ChatAuthTests(unittest.TestCase):
    def setUp(self):
        self._saved = {
            key: os.environ.get(key) for key in ("CLOUD_API_TOKEN", "CORS_ALLOW_ORIGINS")
        }
        os.environ.pop("CLOUD_API_TOKEN", None)
        os.environ.pop("CORS_ALLOW_ORIGINS", None)

    def tearDown(self):
        for key, value in self._saved.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value

    def test_rejects_when_token_unset(self):
        client = TestClient(create_app())
        response = client.post("/api/chat/query", json={"prompt": "hello"})
        self.assertEqual(response.status_code, 503)
        self.assertIn("CLOUD_API_TOKEN", response.json()["detail"])

    def test_rejects_missing_and_wrong_bearer(self):
        os.environ["CLOUD_API_TOKEN"] = "test-token-value"
        client = TestClient(create_app())
        missing = client.post("/api/chat/query", json={"prompt": "hello"})
        self.assertEqual(missing.status_code, 401)
        wrong = client.post(
            "/api/chat/query",
            json={"prompt": "hello"},
            headers={"Authorization": "Bearer not-the-token"},
        )
        self.assertEqual(wrong.status_code, 401)

    def test_accepts_matching_bearer_without_calling_openrouter(self):
        os.environ["CLOUD_API_TOKEN"] = "test-token-value"

        async def fake_query(model, prompt):
            return {"model": model, "response": f"echo:{prompt}", "provider": "test"}

        original = chat.ai_service.query_openrouter
        chat.ai_service.query_openrouter = fake_query
        try:
            client = TestClient(create_app())
            response = client.post(
                "/api/chat/query",
                json={"model": "test-model", "prompt": "hello"},
                headers={"Authorization": "Bearer test-token-value"},
            )
        finally:
            chat.ai_service.query_openrouter = original

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "echo:hello")

    def test_cors_star_is_not_an_allow_all(self):
        os.environ["CORS_ALLOW_ORIGINS"] = "*"
        client = TestClient(create_app())
        response = client.options(
            "/api/chat/query",
            headers={
                "Origin": "https://evil.example",
                "Access-Control-Request-Method": "POST",
            },
        )
        self.assertNotEqual(response.headers.get("access-control-allow-origin"), "*")
        self.assertNotEqual(
            response.headers.get("access-control-allow-origin"), "https://evil.example"
        )
        self.assertNotEqual(response.headers.get("access-control-allow-credentials"), "true")

    def test_cors_allows_only_listed_origin(self):
        os.environ["CORS_ALLOW_ORIGINS"] = "http://localhost:5173"
        client = TestClient(create_app())
        allowed = client.options(
            "/api/chat/query",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type",
            },
        )
        self.assertEqual(allowed.headers.get("access-control-allow-origin"), "http://localhost:5173")
        self.assertNotEqual(allowed.headers.get("access-control-allow-credentials"), "true")

        blocked = client.options(
            "/api/chat/query",
            headers={
                "Origin": "https://elsewhere.example",
                "Access-Control-Request-Method": "POST",
            },
        )
        self.assertNotEqual(
            blocked.headers.get("access-control-allow-origin"), "https://elsewhere.example"
        )


if __name__ == "__main__":
    unittest.main()
