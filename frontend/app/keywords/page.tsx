"use client";
import { useState } from "react";

const CLUSTERS = [
  {
    cluster: "how_do_i",
    label: "How-do-I questions",
    suggestions: [
      "how do I find customers without paid ads",
      "how do I validate my SaaS idea",
      "how to get first 100 users",
      "how do I do customer discovery",
    ],
  },
  {
    cluster: "alternatives",
    label: "Competitor alternatives",
    suggestions: [
      "alternative to cold outreach",
      "better than LinkedIn InMail",
      "Reddit marketing alternative",
      "outreach tool alternative",
    ],
  },
  {
    cluster: "pain_signals",
    label: "Pain signals",
    suggestions: [
      "cold email not working",
      "no one replies to my outreach",
      "finding potential customers hard",
      "B2B lead generation struggle",
    ],
  },
];

const DEFAULT_KEYWORDS = [
  "how to find early adopters",
  "SaaS customer acquisition",
  "B2B outreach",
  "Reddit prospecting",
];

export default function KeywordsPage() {
  const [include, setInclude] = useState<string[]>(DEFAULT_KEYWORDS);
  const [exclude, setExclude] = useState<string[]>(["spam", "hiring", "job posting"]);
  const [subreddits, setSubreddits] = useState<string[]>(["SaaS", "Entrepreneur", "startups", "smallbusiness", "marketing"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newExclude, setNewExclude] = useState("");
  const [newSub, setNewSub] = useState("");
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});

  function addKeyword() {
    const k = newKeyword.trim();
    if (k && !include.includes(k)) setInclude([...include, k]);
    setNewKeyword("");
  }

  function addExclude() {
    const k = newExclude.trim();
    if (k && !exclude.includes(k)) setExclude([...exclude, k]);
    setNewExclude("");
  }

  function addSub() {
    const s = newSub.trim().replace(/^r\//, "");
    if (s && !subreddits.includes(s)) setSubreddits([...subreddits, s]);
    setNewSub("");
  }

  function decide(kw: string, decision: "approved" | "rejected") {
    setDecisions((d) => ({ ...d, [kw]: decision }));
    if (decision === "approved" && !include.includes(kw)) {
      setInclude((prev) => [...prev, kw]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Keywords & Query Builder</h1>
        <p className="text-sm text-gray-500 mt-0.5">Control what Reddit posts you see and get AI suggestions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
        {/* Include keywords */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Include keywords</h2>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {include.map((k) => (
              <span key={k} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">
                {k}
                <button onClick={() => setInclude(include.filter((x) => x !== k))} className="hover:text-red-500 ml-0.5">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Add keyword…"
              className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button onClick={addKeyword} className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Add</button>
          </div>
        </section>

        {/* Exclude keywords */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Exclude keywords</h2>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {exclude.map((k) => (
              <span key={k} className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200">
                {k}
                <button onClick={() => setExclude(exclude.filter((x) => x !== k))} className="hover:text-red-700 ml-0.5">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newExclude}
              onChange={(e) => setNewExclude(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExclude()}
              placeholder="Add exclusion…"
              className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button onClick={addExclude} className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Add</button>
          </div>
        </section>

        {/* Subreddits */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Subreddits to monitor</h2>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {subreddits.map((s) => (
              <span key={s} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-200">
                r/{s}
                <button onClick={() => setSubreddits(subreddits.filter((x) => x !== s))} className="hover:text-red-500 ml-0.5">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSub()}
              placeholder="r/subredditname"
              className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button onClick={addSub} className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Add</button>
          </div>
        </section>

        {/* Coverage indicator */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Connector status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-700">Reddit</span>
              </div>
              <span className="text-xs text-gray-400">Last run: 12 min ago · Next: ~48 min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-sm text-gray-400">X / Twitter</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Feature flagged off</span>
            </div>
          </div>
        </section>

        {/* AI suggestions */}
        <section className="col-span-2 bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI Keyword Suggestions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Based on your product brief. Approve to add, reject to hide.</p>
            </div>
          </div>
          <div className="space-y-5">
            {CLUSTERS.map(({ cluster, label, suggestions }) => (
              <div key={cluster}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
                <div className="space-y-1.5">
                  {suggestions.map((kw) => {
                    const d = decisions[kw];
                    return (
                      <div key={kw} className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-md bg-gray-50 border border-gray-100">
                        <span className="text-sm text-gray-700 flex-1">{kw}</span>
                        {d ? (
                          <span className={`text-xs font-medium ${d === "approved" ? "text-green-600" : "text-gray-400"}`}>
                            {d === "approved" ? "✓ Added" : "✕ Rejected"}
                          </span>
                        ) : (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => decide(kw, "approved")}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1 rounded border border-green-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => decide(kw, "rejected")}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 px-2.5 py-1 rounded transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
