"use client";
import { MOCK_OPPORTUNITIES } from "@/lib/api";

function count(field: string, value: string) {
  return MOCK_OPPORTUNITIES.filter((o: Record<string, unknown>) => o[field] === value).length;
}

const STATUS_ORDER = ["new", "reviewed", "drafted", "posted", "replied", "follow_up", "won", "lost"] as const;
const INTENT_ORDER = ["seeking_solution", "recommendation_req", "comparing", "troubleshooting", "complaining", "discovery"] as const;

export default function AnalyticsPage() {
  const total = MOCK_OPPORTUNITIES.length;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Basic v1 — counts by status and intent</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total opportunities", value: total },
            { label: "New (unreviewed)", value: count("status", "new") },
            { label: "Drafts generated", value: count("status", "drafted") + count("status", "posted") + count("status", "replied") },
            { label: "Won", value: count("status", "won") },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By status</h2>
          <div className="space-y-2">
            {STATUS_ORDER.map((s) => {
              const n = count("status", s);
              const pct = total > 0 ? (n / total) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 capitalize">{s.replace("_", " ")}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 tabular-nums w-4 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intent breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By intent</h2>
          <div className="space-y-2">
            {INTENT_ORDER.map((intent) => {
              const n = count("intent_label", intent);
              const pct = total > 0 ? (n / total) * 100 : 0;
              return (
                <div key={intent} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-36">{intent.replace("_", " ")}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 tabular-nums w-4 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average score */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Average opportunity score</h2>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(MOCK_OPPORTUNITIES.reduce((a, o) => a + o.opportunity_score, 0) / total * 100)}
          </p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          Full analytics dashboard (follow-up rates, draft adoption, conversion) coming in Sprint 3.
        </p>
      </div>
    </div>
  );
}
