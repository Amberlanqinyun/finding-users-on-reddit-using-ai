"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_OPPORTUNITIES, MOCK_DRAFTS, type OpportunityStatus } from "@/lib/api";
import IntentBadge from "@/components/IntentBadge";
import StatusBadge from "@/components/StatusBadge";
import ScoreBar from "@/components/ScoreBar";

const TONE_PRESETS = ["empathetic", "casual_friendly", "professional", "technical", "direct"] as const;
type TonePreset = typeof TONE_PRESETS[number];

const STATUS_PIPELINE: OpportunityStatus[] = [
  "new", "reviewed", "drafted", "posted", "replied", "follow_up", "won", "lost",
];

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const opportunity = MOCK_OPPORTUNITIES.find((o) => o.id === id);
  const [tone, setTone] = useState<TonePreset>("empathetic");
  const [status, setStatus] = useState<OpportunityStatus>(opportunity?.status ?? "new");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [editedBody, setEditedBody] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p>Opportunity not found.</p>
        </div>
      </div>
    );
  }

  const drafts = MOCK_DRAFTS[id] ?? [];
  const activeDraft = drafts[activeVariant];
  const body = editedBody[activeDraft?.id ?? ""] ?? activeDraft?.body ?? "";

  function handleCopy() {
    if (!body) return;
    navigator.clipboard.writeText(body);
    setCopied(activeDraft?.id ?? "");
    setTimeout(() => setCopied(null), 2000);
  }

  function handleRegenerate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <span className="text-gray-200">|</span>
        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">r/{opportunity.subreddit}</span>
        <IntentBadge intent={opportunity.intent_label} />
        <div className="ml-auto flex items-center gap-3">
          <ScoreBar score={opportunity.opportunity_score} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
            className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {STATUS_PIPELINE.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: post detail */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
          <h2 className="text-base font-semibold text-gray-900 leading-snug">{opportunity.title}</h2>
          <p className="text-xs text-gray-400 mt-1.5 mb-4">
            u/{opportunity.author} · {new Date(opportunity.posted_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{opportunity.body}</p>

          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-orange-600 hover:underline"
          >
            Open on Reddit ↗
          </a>

          {/* Score factors */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Why this is ranked</p>
            <ul className="space-y-1">
              {opportunity.score_factors.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Confidence:</span>
              <span className="text-xs font-medium text-gray-700">{Math.round(opportunity.intent_confidence * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Right: draft editor */}
        <div className="w-1/2 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Reply drafts</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Tone:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as TonePreset)}
                className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              >
                {TONE_PRESETS.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
              >
                {generating ? "Generating…" : "↺ Regenerate"}
              </button>
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-3 border-2 border-dashed border-gray-200 rounded-lg p-8">
              <p className="text-3xl">✍️</p>
              <p className="text-sm text-center">No drafts yet.<br />Click Regenerate to generate 2–3 variants.</p>
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {generating ? "Generating…" : "Generate drafts"}
              </button>
            </div>
          ) : (
            <>
              {/* Variant tabs */}
              <div className="flex gap-1">
                {drafts.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveVariant(i)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      activeVariant === i
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Variant {i + 1}
                  </button>
                ))}
              </div>

              {/* Editor */}
              {activeDraft && (
                <>
                  {activeDraft.salesiness_score > 0.3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-xs font-medium text-yellow-700 mb-1">⚠️ Salesiness warning</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {activeDraft.warnings.map((w) => (
                          <li key={w} className="text-xs text-yellow-600">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <textarea
                    value={body}
                    onChange={(e) =>
                      setEditedBody((prev) => ({ ...prev, [activeDraft.id]: e.target.value }))
                    }
                    rows={10}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{body.length} chars</span>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        copied === activeDraft.id
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {copied === activeDraft.id ? "✓ Copied!" : "Copy reply"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
