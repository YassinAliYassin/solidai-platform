"""
WhatsApp queue router.

Provides a small provider-agnostic queue for WhatsApp messages:
  * POST /api/whatsapp/queue  -> enqueue an outgoing message
  * GET  /api/whatsapp/queue  -> list pending outgoing messages
  * POST /api/whatsapp/send   -> attempt to dispatch the next queued message
  * POST /api/whatsapp/webhook-> receive inbound messages (Meta Cloud API / Twilio style)

The actual delivery to WhatsApp is intentionally decoupled behind `deliver()`.
Wire in Twilio or the Meta Graph API there; until then delivery is a no-op that
returns False so the module runs without any credentials.
"""

from __future__ import annotations

import asyncio
import time
import uuid
from enum import Enum
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


class MessageStatus(str, Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class OutgoingMessage(BaseModel):
    to: str = Field(..., description="Recipient phone number in E.164, e.g. +26377xxxxxxx")
    body: str = Field(..., description="Text body of the message")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class QueuedMessage(OutgoingMessage):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    status: MessageStatus = MessageStatus.pending
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


# In-memory store. Swap for Redis/DB in production.
_OUTBOX: List[QueuedMessage] = []
_INBOX: List[Dict[str, Any]] = []
_LOCK = asyncio.Lock()


async def deliver(message: OutgoingMessage) -> bool:
    """
    Deliver a message to WhatsApp.

    TODO: implement with your provider, e.g.
      * Twilio: twilio.rest.Client(...).messages.create(...)
      * Meta Cloud API: POST https://graph.facebook.com/v19.0/<PHONE_ID>/messages
    Return True on success, False if undeliverable.
    """
    # Not configured yet -> nothing actually sent.
    return False


@router.post("/queue", response_model=QueuedMessage, status_code=201)
async def enqueue(message: OutgoingMessage):
    """Add an outgoing message to the queue."""
    async with _LOCK:
        item = QueuedMessage(**message.model_dump())
        _OUTBOX.append(item)
    return item


@router.get("/queue", response_model=List[QueuedMessage])
async def list_queue(status: Optional[MessageStatus] = None):
    """List queued outgoing messages, optionally filtered by status."""
    async with _LOCK:
        items = _OUTBOX
        if status is not None:
            items = [m for m in items if m.status == status]
        return list(items)


@router.post("/send", response_model=QueuedMessage)
async def send_next():
    """Attempt to dispatch the oldest pending message."""
    async with _LOCK:
        pending = [m for m in _OUTBOX if m.status == MessageStatus.pending]
        if not pending:
            raise HTTPException(status_code=404, detail="No pending messages in queue")
        item = pending[0]

    ok = await deliver(item)
    async with _LOCK:
        item.status = MessageStatus.sent if ok else MessageStatus.failed
        item.updated_at = time.time()
    if not ok:
        raise HTTPException(
            status_code=502,
            detail="Delivery provider not configured or failed; message marked failed.",
        )
    return item


@router.post("/webhook")
async def webhook(payload: Dict[str, Any]):
    """Receive an inbound WhatsApp message (Meta/Twilio style, generic dict)."""
    async with _LOCK:
        record = {"received_at": time.time(), "payload": payload}
        _INBOX.append(record)
    return {"status": "received"}


@router.get("/inbox", response_model=List[Dict[str, Any]])
async def list_inbox():
    """List received inbound messages (for debugging)."""
    async with _LOCK:
        return list(_INBOX)
