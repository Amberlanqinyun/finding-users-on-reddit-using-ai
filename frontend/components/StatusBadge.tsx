import type { OpportunityStatus } from "@/lib/api";

const CONFIG: Record<OpportunityStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-50 text-blue-600 ring-1 ring-blue-200" },
  reviewed: { label: "Reviewed", color: "bg-gray-100 text-gray-600" },
  drafted: { label: "Drafted", color: "bg-orange-50 text-orange-600 ring-1 ring-orange-200" },
  posted: { label: "Posted", color: "bg-green-50 text-green-600 ring-1 ring-green-200" },
  replied: { label: "Replied", color: "bg-green-100 text-green-700" },
  follow_up: { label: "Follow-up", color: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" },
  won: { label: "Won ✓", color: "bg-green-200 text-green-800 font-semibold" },
  lost: { label: "Lost", color: "bg-red-50 text-red-500" },
};

export default function StatusBadge({ status }: { status: OpportunityStatus }) {
  const { label, color } = CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
