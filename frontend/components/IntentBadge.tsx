import type { IntentLabel } from "@/lib/api";

const CONFIG: Record<IntentLabel, { label: string; color: string }> = {
  seeking_solution: { label: "Seeking solution", color: "bg-green-100 text-green-700" },
  recommendation_req: { label: "Recommendation req", color: "bg-blue-100 text-blue-700" },
  comparing: { label: "Comparing", color: "bg-purple-100 text-purple-700" },
  complaining: { label: "Complaining", color: "bg-gray-100 text-gray-600" },
  troubleshooting: { label: "Troubleshooting", color: "bg-yellow-100 text-yellow-700" },
  discovery: { label: "Discovery", color: "bg-teal-100 text-teal-700" },
};

export default function IntentBadge({ intent }: { intent: IntentLabel }) {
  const { label, color } = CONFIG[intent] ?? { label: intent, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
