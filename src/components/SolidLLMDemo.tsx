import { useState } from "react";
import { Sparkles, Terminal, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

/**
 * Live demo of the *from-scratch* Solid LLM — the small character-level
 * transformer in packages/llm, served by its FastAPI inference API
 * (inference/api_v2.py, POST /generate).
 *
 * This is deliberately distinct from the site's production assistant (the
 * ChatBot, powered by a capable model). This demo showcases OUR own trained
 * weights: a ~3.2M-parameter research preview that produces on-topic English,
 * not factual answers.
 *
 * Point it at a running inference server with VITE_SOLID_LLM_API, e.g.
 *   VITE_SOLID_LLM_API="https://api.solidsolutions.africa"
 * If unset, the demo renders an explanatory "how to run it" state instead of
 * pretending to work.
 */
const SOLID_LLM_API = (import.meta as any).env?.VITE_SOLID_LLM_API || "";

const EXAMPLE_PROMPTS = [
  "Solid Solutions builds",
  "SolidAI helps farmers",
  "In agriculture,",
  "Our mission is to",
];

export default function SolidLLMDemo() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const res = await fetch(`${SOLID_LLM_API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 160, temperature: 0.7, top_k: 40 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.detail || `Model server error (${res.status}).`);
      } else {
        setOutput((data.text as string) || (prompt + (data.completion || "")));
      }
    } catch {
      setError("Couldn't reach the model server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="try" className="py-24 bg-bg-main">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal/5 rounded-full border border-charcoal/10 text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} /> <span>Research Preview · Built From Scratch</span>
          </div>
          <h2 className="text-4xl font-bold text-charcoal mb-4">Try our from-scratch model</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            This is Solid LLM's own character-level transformer (~3.2M parameters),
            trained from scratch in PyTorch on a first-party corpus. It generates
            on-topic English to demonstrate the real training and inference
            pipeline — it is a research preview, not a factual question-answering
            model. For real questions, use the assistant in the corner.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm p-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-charcoal resize-none"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-charcoal/15 text-slate-600 hover:bg-charcoal/5"
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={loading || !prompt.trim() || !SOLID_LLM_API}
            className="mt-4 px-6 py-3 bg-charcoal text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-charcoal/90 transition-all disabled:opacity-40"
          >
            {loading ? "Generating…" : "Generate"}
          </button>

          {output && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 whitespace-pre-wrap"
            >
              {output}
            </motion.div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!SOLID_LLM_API && (
            <div className="mt-6 flex items-start gap-2 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              <Terminal size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-700 mb-1">Model server not connected</p>
                <p>
                  Run it locally from <code className="bg-slate-200 px-1 rounded">packages/llm</code>:
                  <br />
                  <code className="bg-slate-200 px-1 rounded">
                    uvicorn inference.api_v2:app --port 8002
                  </code>
                  <br />
                  then build the site with{" "}
                  <code className="bg-slate-200 px-1 rounded">
                    VITE_SOLID_LLM_API=http://localhost:8002
                  </code>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
