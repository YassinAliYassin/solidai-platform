import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, hermes
from whatsapp_queue import router as whatsapp_router


def parse_cors_origins(raw: str | None) -> list[str]:
    """Comma-separated origin allowlist. `*` is ignored; empty means no browser CORS."""
    if not raw:
        return []
    origins: list[str] = []
    for part in raw.split(","):
        origin = part.strip()
        if not origin or origin == "*":
            continue
        origins.append(origin)
    return origins


def create_app() -> FastAPI:
    application = FastAPI(title="Solid Cloud AI Hub", version="1.0.0")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=parse_cors_origins(os.getenv("CORS_ALLOW_ORIGINS")),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @application.get("/")
    async def root():
        return {"status": "online", "service": "Solid Cloud AI Hub"}

    @application.get("/health")
    async def health():
        return {"status": "healthy"}

    application.include_router(chat.router)
    application.include_router(hermes.router)
    application.include_router(whatsapp_router)
    return application


app = create_app()
