/**
 * Solid LLM website assistant - serverless backend (Vercel Node function).
 *
 * The site (solidsolutions.africa) is static, so it calls this same-origin
 * endpoint instead of talking to a model provider from the browser. The API key
 * lives in a server-side environment variable and is never shipped to visitors.
 *
 * Provider: OpenRouter (https://openrouter.ai). Set one env var in Vercel:
 *     OPENROUTER_API_KEY   (required)
 *     SOLID_LLM_MODEL      (optional, defaults to a capable general model)
 *
 * Request  (POST application/json):
 *     { message: string, sector?: string, history?: {role,content}[] }
 * Response (200):
 *     { reply: string, model: string }
 * Errors:  400 bad input, 405 wrong method, 500 not configured / upstream error.
 */

import { buildSystemPrompt } from "./_context";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY = 8;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Minimal request/response typing so we don't need @vercel/node at type time.
interface Req {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

function readBody(req: Req): any {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        "Assistant is not configured. Set the OPENROUTER_API_KEY environment variable on the server.",
    });
    return;
  }

  const body = readBody(req);
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sector = typeof body.sector === "string" ? body.sector : "general";
  if (!message) {
    res.status(400).json({ error: "Missing 'message'." });
    return;
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE_CHARS} chars).` });
    return;
  }

  // Sanitise optional prior turns from the client.
  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m: any) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .slice(-MAX_HISTORY)
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_CHARS) }))
    : [];

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(sector) },
    ...history,
    { role: "user", content: message },
  ];

  const model = process.env.SOLID_LLM_MODEL || DEFAULT_MODEL;

  try {
    const upstream = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://solidsolutions.africa",
        "X-Title": "Solid LLM",
      },
      body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 800 }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({
        error: "Upstream model error.",
        status: upstream.status,
        detail: detail.slice(0, 500),
      });
      return;
    }

    const data: any = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      res.status(502).json({ error: "Empty response from model." });
      return;
    }
    res.status(200).json({ reply, model });
  } catch (err: any) {
    res.status(500).json({ error: "Request failed.", detail: String(err?.message || err) });
  }
}
