"""MCP solid_cloud_chat must send CLOUD_API_TOKEN and fail closed when it is unset."""

import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from mcp_auth import post_cloud_chat  # noqa: E402


class RecordingClient:
    def __init__(self):
        self.calls = []

    async def post(self, path, json=None, headers=None):
        self.calls.append({"path": path, "json": json, "headers": headers})
        return {"ok": True}


class McpChatAuthTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self._saved = os.environ.get("CLOUD_API_TOKEN")
        os.environ.pop("CLOUD_API_TOKEN", None)

    def tearDown(self):
        if self._saved is None:
            os.environ.pop("CLOUD_API_TOKEN", None)
        else:
            os.environ["CLOUD_API_TOKEN"] = self._saved

    async def test_unset_token_errors_before_the_request(self):
        client = RecordingClient()
        with self.assertRaises(RuntimeError) as caught:
            await post_cloud_chat(client, "hello", "test-model")
        self.assertIn("CLOUD_API_TOKEN", str(caught.exception))
        self.assertEqual(client.calls, [])

    async def test_blank_token_errors_before_the_request(self):
        os.environ["CLOUD_API_TOKEN"] = "   "
        client = RecordingClient()
        with self.assertRaises(RuntimeError) as caught:
            await post_cloud_chat(client, "hello", "test-model")
        self.assertIn("CLOUD_API_TOKEN", str(caught.exception))
        self.assertEqual(client.calls, [])

    async def test_sends_bearer_token_on_chat_query(self):
        os.environ["CLOUD_API_TOKEN"] = "mcp-secret"
        client = RecordingClient()
        result = await post_cloud_chat(client, "hello", "test-model")
        self.assertEqual(result, {"ok": True})
        self.assertEqual(
            client.calls,
            [
                {
                    "path": "/api/chat/query",
                    "json": {"prompt": "hello", "model": "test-model"},
                    "headers": {"Authorization": "Bearer mcp-secret"},
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
