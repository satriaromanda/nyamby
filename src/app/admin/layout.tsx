"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "spark" as const },
  { href: "/admin/users", label: "Users", icon: "user" as const },
  { href: "/admin/jobs", label: "Jobs", icon: "briefcase" as const },
  { href: "/admin/disputes", label: "Disputes", icon: "shield" as const },
  { href: "/admin/escrow", label: "Escrow", icon: "money" as const },
  { href: "/admin/ai-stats", label: "AI Stats", icon: "ai" as const },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-surface-200">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <span className="mt-2 inline-block text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "text-surface-500 hover:bg-surface-50 hover:text-surface-700"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Icon name="x" size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
