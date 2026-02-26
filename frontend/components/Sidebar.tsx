"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Inbox", icon: "📥" },
  { href: "/brief", label: "Product Brief", icon: "📝" },
  { href: "/keywords", label: "Keywords", icon: "🔍" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-5 py-4 border-b border-gray-200">
        <span className="font-bold text-gray-900 text-sm tracking-tight">FindingUsers</span>
        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">MVP</span>
      </div>
      <nav className="flex-1 py-3">
        {nav.map(({ href, label, icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                active
                  ? "bg-orange-50 text-orange-700 font-medium border-r-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700">
            Y
          </div>
          <span className="text-xs text-gray-500 truncate">your@workspace.com</span>
        </div>
      </div>
    </aside>
  );
}
