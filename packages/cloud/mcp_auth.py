"""Bearer token for internal callers of POST /api/chat/query."""

import os


def cloud_chat_authorization_headers() -> dict[str, str]:
    """Authorization header for the cloud chat route.

    Raises RuntimeError when CLOUD_API_TOKEN is missing or blank so the
    caller fails before sending an unauthenticated request.
    """
    token = os.getenv("CLOUD_API_TOKEN", "").strip()
    if not token:
        raise RuntimeError(
            "CLOUD_API_TOKEN is not set. "
            "solid_cloud_chat cannot call POST /api/chat/query until it is configured."
        )
    return {"Authorization": f"Bearer {token}"}


async def post_cloud_chat(client, prompt: str, model: str):
    """POST /api/chat/query with the bearer token from the environment."""
    return await client.post(
        "/api/chat/query",
        json={"prompt": prompt, "model": model},
        headers=cloud_chat_authorization_headers(),
    )
