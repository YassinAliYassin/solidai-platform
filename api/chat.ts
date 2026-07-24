/**
 * Solid LLM website assistant - serverless backend (Vercel Node function).
 *
 * The site is static, so it calls this same-origin endpoint instead of talking
 * to a model provider from the browser. The API key lives in a server-side
 * environment variable and is never shipped to visitors.
 *
 * This file is intentionally self-contained (no local imports): Vercel's ESM
 * runtime does not resolve extensionless relative imports, so the grounding
 * context is inlined below rather than imported. Keep it in sync with
 * packages/llm/data/knowledge.md and public/api/chat.php.
 *
 * Provider: OpenRouter (https://openrouter.ai). Environment variables:
 *     OPENROUTER_API_KEY   (required)
 *     SOLID_LLM_MODEL      (optional, defaults to a capable general model)
 *
 * Request  (POST application/json):
 *     { message: string, sector?: string, history?: {role,content}[] }
 * Response (200):
 *     { reply: string, model: string }
 */

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY = 8;

// --- Grounding (keep in sync with packages/llm/data/knowledge.md) ----------
const SOLID_KNOWLEDGE = `
Solid Solutions is a technology initiative focused on Africa's digital future. It
works on experimental AI and infrastructure projects, contributing to emerging
technical initiatives and early-stage technology development. Contact:
info@solidsolutions.africa. Website: solidsolutions.africa.

SolidAI is the applied-AI program of Solid Solutions. Its goal is AI that is
practical for the African context: understanding local languages and powering
digital infrastructure. It focuses on hyper-local NLP for diverse African
dialects, edge efficiency for low-power hardware, and a privacy-first approach
that keeps sensitive data within defined boundaries. SolidAI is in beta;
developers can request early access to its APIs and models via the beta program.

Solid LLM is Solid Solutions' language-model research effort, including a
transformer built from scratch in PyTorch. The current public research preview
is a small character-level model trained on first-party text - an honest
demonstration of the training and inference pipeline, not a large production
model. Research targets hyper-local NLP for African dialects, agri-tech such as
crop-disease detection, predictive models for inclusive finance, and edge
deployment on low-power hardware.

Sectors SolidAI advises on: agriculture (crop selection, soil, pests,
irrigation), health (preventive care, malaria/HIV/TB, maternal and child health,
access in resource-limited settings), education (curriculum, teacher training,
digital literacy, remote students), finance (mobile money, microfinance, savings
groups, financial inclusion for the unbanked), legal (land rights, business
registration, contracts, access to justice), transport (last-mile delivery,
public transit, rural roads, cross-border logistics), and energy (off-grid
solar, mini-grids, clean cooking, pay-as-you-go access).

Privacy: Solid Solutions collects only basic contact information submitted
voluntarily, uses it solely to respond to inquiries and share updates, and does
not sell or share personal information for marketing.
`.trim();

const SECTOR_PROMPTS: Record<string, string> = {
  general:
    "You are a knowledgeable advisor for the African context, giving practical, actionable guidance grounded in local realities.",
  agriculture:
    "You are an agricultural expert focused on African farming: crop selection, soil management, pest control, irrigation, and sustainable practices for African climates and small-scale farmers.",
  health:
    "You are a healthcare advisor for African clinics and communities: preventive care, malaria/HIV/TB, maternal and child health, nutrition, and healthcare access in resource-limited settings. You are not a substitute for a doctor; recommend professional care for personal medical issues.",
  education:
    "You are an education specialist for African schools: curriculum development, teacher training, digital literacy, multilingual education, and reaching remote or underserved students.",
  finance:
    "You are a fintech advisor for African markets: mobile money, microfinance, savings groups, digital payments, and financial inclusion for the unbanked. You provide general information, not personalised investment or financial advice.",
  legal:
    "You are a legal information guide for African contexts: land rights, business registration, contract basics, and access to justice. You provide general information, not formal legal advice.",
  transport:
    "You are a transport and logistics expert for Africa: last-mile delivery, public transit, rural road access, cross-border transport, and local transport modes.",
  energy:
    "You are a renewable-energy advisor for Africa: off-grid solar, mini-grids, clean cooking, energy access for rural areas, and pay-as-you-go models.",
};

function buildSystemPrompt(sector: string): string {
  const persona = SECTOR_PROMPTS[sector] ?? SECTOR_PROMPTS.general;
  return [
    "You are Solid LLM, the AI assistant for Solid Solutions (solidsolutions.africa).",
    persona,
    "",
    "Use the following facts about Solid Solutions when the user asks about the",
    "company, its products (SolidAI, Solid LLM), or how to get involved. If you",
    "do not know something, say so and point them to info@solidsolutions.africa.",
    "Be concise, warm, and practical. Do not invent product features, prices, or",
    "dates that are not in the facts below.",
    "",
    "--- Solid Solutions facts ---",
    SOLID_KNOWLEDGE,
    "--- end facts ---",
  ].join("\n");
}

// ---------------------------------------------------------------------------
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
