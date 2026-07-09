"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

/**
 * Role-aware dashboard sidebar (PRD v5.3 §6.6 + §6.12).
 * Layout structure from the reference design; visual language from the
 * existing token system (surface-*, gradient-primary) — NOT the navy/beige
 * reference colors. Icon + text label (not icon-only): §6.6 recorded the
 * complaint about ambiguous navigation, labels reduce guessing.
 * Collapses to icon-only on md, bottom bar on mobile.
 */

type Role = "talent" | "client";

interface MenuItem {
  label: string;
  href: string;
  icon: "chart" | "search" | "briefcase" | "spark" | "alertTriangle" | "settings" | "users" | "file";
}

const MENUS: Record<Role, MenuItem[]> = {
  talent: [
    { label: "Dashboard", href: "/talent/dashboard", icon: "chart" },
    { label: "Cari Kerja", href: "/jobs", icon: "search" },
    { label: "Edit Profil", href: "/talent/edit-profile", icon: "spark" },
    { label: "Disputes", href: "/talent/disputes", icon: "alertTriangle" },
  ],
  client: [
    { label: "Dashboard", href: "/client/dashboard", icon: "chart" },
    { label: "Cari Talenta", href: "/client/talents", icon: "users" },
    { label: "Post Job", href: "/client/post-job", icon: "briefcase" },
    { label: "Disputes", href: "/client/disputes", icon: "alertTriangle" },
  ],
};

export function DashboardSidebar({ 
  role,
  isMinimized = false,
  onToggleMinimize
}: { 
  role: Role;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUserName(d.user.full_name || "");
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  const items = MENUS[role];
  const settingsHref = role === "talent" ? "/talent/settings" : "/client/settings";
  const isActive = (href: string) =>
    pathname === href || (href !== "/jobs" && href !== "/talents" && pathname.startsWith(href));

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isMinimized ? "justify-center" : ""} ${
      active
        ? "gradient-primary text-white shadow-md shadow-primary-500/20"
        : "text-surface-500 hover:bg-surface-100 hover:text-surface-900"
    }`;

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-surface-200 z-40 transition-all duration-300 ${isMinimized ? "w-20" : "w-56 lg:w-60"}`}>
        <div className={`h-16 flex items-center px-5 border-b border-surface-200 ${isMinimized ? "justify-center" : "justify-between"}`}>
          {!isMinimized ? (
            <Link href="/" className="flex items-center gap-2">
              <Logo height={36} />
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded gradient-primary text-white font-bold flex items-center justify-center">N</div>
            </Link>
          )}
          
          {!isMinimized && onToggleMinimize && (
            <button onClick={onToggleMinimize} className="text-surface-400 hover:text-surface-900">
              <Icon name="menu" size={18} />
            </button>
          )}
        </div>

        <div className="px-3 pt-4 pb-2 flex flex-col gap-2">
          {isMinimized && onToggleMinimize && (
            <button onClick={onToggleMinimize} className="text-surface-400 hover:text-surface-900 mx-auto mb-2">
              <Icon name="menu" size={18} />
            </button>
          )}
          {!isMinimized && (
            <p className="px-3 text-[10px] font-semibold tracking-widest text-surface-400 uppercase">
              {role === "talent" ? "Talent Portal" : "Client Portal"}
            </p>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
              <Icon name={item.icon} size={17} />
              {!isMinimized && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1 border-t border-surface-200 pt-3">
          <Link href={settingsHref} className={linkClass(isActive(settingsHref))}>
            <Icon name="settings" size={17} />
            {!isMinimized && <span>Settings</span>}
          </Link>
          <div className={`flex items-center gap-3 px-3 py-2.5 ${isMinimized ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </div>
            {!isMinimized && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-900 truncate">{userName || "…"}</p>
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-surface-400 hover:text-red-600 transition-colors"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-surface-200 flex items-stretch"
        aria-label="Dashboard navigation"
      >
        {[...items, { label: "Settings", href: settingsHref, icon: "settings" as const }].map(
          (item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium ${
                  active ? "text-primary-600" : "text-surface-400"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
    </>
  );
}

export default DashboardSidebar;
