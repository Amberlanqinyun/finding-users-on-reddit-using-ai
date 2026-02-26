"use client";
import { useState } from "react";

const TONE_PRESETS = [
  { id: "empathetic", label: "Empathetic" },
  { id: "casual_friendly", label: "Casual & Friendly" },
  { id: "professional", label: "Professional" },
  { id: "technical", label: "Technical" },
  { id: "direct", label: "Direct" },
] as const;

type TonePreset = typeof TONE_PRESETS[number]["id"];

export default function BriefPage() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<"idle" | "draft" | "active">("draft");
  const [tone, setTone] = useState<TonePreset>("empathetic");
  const [formality, setFormality] = useState(50);
  const [brief, setBrief] = useState({
    persona: "Early-stage B2B SaaS founders (1–10 person teams) trying to find their first 50 customers without a marketing budget.",
    pains: "Manual Reddit monitoring is slow and noisy.\nCold outreach has terrible conversion rates.\nHard to know which conversations are worth replying to.\nDrafting good replies takes too long.",
    value_props: "Surfaces high-intent posts automatically.\nAI scores and prioritizes opportunities.\nGenerates context-aware drafts that don't sound salesy.",
    taboo_phrases: "\"check out\", \"sign up now\", \"free trial\", \"limited time\", \"our product will\"",
    examples: "Great question — the key thing I found is that most early-stage SaaS founders underestimate how long it takes to see signal from any single channel. What does your current outreach look like?",
  });

  function handleFetch() {
    if (!url.trim()) return;
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      // Simulate brief extraction
    }, 2000);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Product Brief</h1>
            <p className="text-sm text-gray-500 mt-0.5">Define your ICP, voice, and guardrails</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {status === "active" ? "Active" : "Draft"}
            </span>
            <button
              onClick={() => setStatus(status === "active" ? "draft" : "active")}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              {status === "active" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-8">
        {/* URL onboarding */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Generate from your website</h2>
          <p className="text-xs text-gray-500 mb-3">Paste your URL and we'll extract ICP, pains, and value props automatically.</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourproduct.com"
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={handleFetch}
              disabled={fetching || !url.trim()}
              className="bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {fetching ? "Fetching…" : "Extract brief"}
            </button>
          </div>
        </section>

        {/* Persona */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">ICP / Persona</label>
          <p className="text-xs text-gray-400 mb-2">Who is your ideal customer? Be specific.</p>
          <textarea
            value={brief.persona}
            onChange={(e) => setBrief({ ...brief, persona: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </section>

        {/* Pains */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Key Pains</label>
          <p className="text-xs text-gray-400 mb-2">One pain per line. These inform intent scoring and draft angle.</p>
          <textarea
            value={brief.pains}
            onChange={(e) => setBrief({ ...brief, pains: e.target.value })}
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </section>

        {/* Value props */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Value Propositions</label>
          <textarea
            value={brief.value_props}
            onChange={(e) => setBrief({ ...brief, value_props: e.target.value })}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </section>

        {/* Tone */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Tone & Voice</label>
          <div className="flex gap-2 flex-wrap mb-4">
            {TONE_PRESETS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTone(id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tone === id
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-14">Casual</span>
            <input
              type="range"
              min={0}
              max={100}
              value={formality}
              onChange={(e) => setFormality(Number(e.target.value))}
              className="flex-1 accent-orange-500"
            />
            <span className="text-xs text-gray-500 w-14 text-right">Formal</span>
          </div>
        </section>

        {/* Taboo phrases */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Taboo Phrases</label>
          <p className="text-xs text-gray-400 mb-2">Comma-separated. Drafts containing these will show a warning.</p>
          <textarea
            value={brief.taboo_phrases}
            onChange={(e) => setBrief({ ...brief, taboo_phrases: e.target.value })}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-mono"
          />
        </section>

        {/* Example replies */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Example Replies</label>
          <p className="text-xs text-gray-400 mb-2">Add 3–10 replies in your voice. We'll extract style notes automatically.</p>
          <textarea
            value={brief.examples}
            onChange={(e) => setBrief({ ...brief, examples: e.target.value })}
            rows={5}
            placeholder="Paste example replies you've written…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </section>

        <div className="flex justify-end pb-8">
          <button
            onClick={() => setStatus("active")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
