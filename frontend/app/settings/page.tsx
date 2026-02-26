"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState("My Workspace");
  const [redditOn, setRedditOn] = useState(true);
  const [xOn, setXOn] = useState(false);
  const [dmDrafts, setDmDrafts] = useState(false);
  const [dailyCap, setDailyCap] = useState(20);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Workspace, connectors, and feature flags</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-8">
        {/* Workspace */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Workspace</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name</label>
              <input
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Plan</label>
              <span className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md block">Starter (MVP) — limits TBD</span>
            </div>
          </div>
        </section>

        {/* Connectors / feature flags */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Connectors</h2>
          <div className="space-y-4">
            <Toggle
              label="Reddit connector"
              description="Monitor subreddits and keywords via Reddit API"
              checked={redditOn}
              onChange={setRedditOn}
            />
            <Toggle
              label="X / Twitter connector"
              description="Feature flagged — requires X API v2 access"
              checked={xOn}
              onChange={setXOn}
              badge="Requires API access"
            />
          </div>
        </section>

        {/* Guardrails */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Guardrails</h2>
          <div className="space-y-4">
            <Toggle
              label="DM drafts"
              description="Allow generating DM draft templates (always requires manual copy — never auto-sent)"
              checked={dmDrafts}
              onChange={setDmDrafts}
              badge="Off by default"
            />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Daily recommended reply cap
              </label>
              <p className="text-xs text-gray-400 mb-2">You'll see a warning if you copy more drafts than this in a day.</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 w-8">{dailyCap}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team members placeholder */}
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Team</h2>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-700">Y</div>
              <div>
                <p className="text-sm font-medium text-gray-900">your@workspace.com</p>
                <p className="text-xs text-gray-400">Owner</p>
              </div>
            </div>
          </div>
          <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">
            + Invite teammate
          </button>
          <p className="text-xs text-gray-400 mt-1">Team roles (Admin/Member/Viewer) — Sprint 3</p>
        </section>

        <div className="flex justify-end pb-8">
          <button
            onClick={save}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              saved ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {saved ? "✓ Saved" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  badge,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {badge && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{badge}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
