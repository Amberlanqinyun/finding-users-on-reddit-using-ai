"use client";
import { useState } from "react";
import Link from "next/link";
import { MOCK_OPPORTUNITIES, type Opportunity, type IntentLabel, type OpportunityStatus } from "@/lib/api";
import IntentBadge from "@/components/IntentBadge";
import StatusBadge from "@/components/StatusBadge";
import ScoreBar from "@/components/ScoreBar";

const INTENT_FILTERS: { value: IntentLabel | "all"; label: string }[] = [
  { value: "all", label: "All intents" },
  { value: "seeking_solution", label: "Seeking solution" },
  { value: "recommendation_req", label: "Recommendation" },
  { value: "comparing", label: "Comparing" },
  { value: "troubleshooting", label: "Troubleshooting" },
  { value: "complaining", label: "Complaining" },
  { value: "discovery", label: "Discovery" },
];

const STATUS_FILTERS: { value: OpportunityStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "drafted", label: "Drafted" },
  { value: "posted", label: "Posted" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function InboxPage() {
  const [intentFilter, setIntentFilter] = useState<IntentLabel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_OPPORTUNITIES.filter((o) => {
    if (intentFilter !== "all" && o.intent_label !== intentFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.opportunity_score - a.opportunity_score);

  const newCount = MOCK_OPPORTUNITIES.filter((o) => o.status === "new").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {newCount} new opportunit{newCount === 1 ? "y" : "ies"} · sorted by score
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Reddit connected · last fetch 12 min ago
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value as IntentLabel | "all")}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {INTENT_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OpportunityStatus | "all")}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {STATUS_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">{filtered.length} items</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No opportunities match your filters.</p>
          </div>
        ) : (
          filtered.map((o) => <OpportunityRow key={o.id} opportunity={o} />)
        )}
      </div>
    </div>
  );
}

function OpportunityRow({ opportunity: o }: { opportunity: Opportunity }) {
  return (
    <Link href={`/opportunity/${o.id}`} className="block hover:bg-gray-50 transition-colors">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                r/{o.subreddit}
              </span>
              <IntentBadge intent={o.intent_label} />
              <StatusBadge status={o.status} />
              <span className="text-xs text-gray-400">{timeAgo(o.posted_at)}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{o.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{o.body}</p>
            <p className="text-xs text-gray-400 mt-1.5">u/{o.author}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <ScoreBar score={o.opportunity_score} />
            <div className="flex flex-col gap-0.5 items-end">
              {o.score_factors.slice(0, 2).map((f) => (
                <span key={f} className="text-xs text-gray-400 text-right">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
