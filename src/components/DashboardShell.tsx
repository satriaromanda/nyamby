"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";

/**
 * Shared shell for /talent/* and /client/* (PRD v5.3 §6.12).
 * Renders the role sidebar + content offset. Exempt paths (onboarding flow,
 * escrow payment flow, public talent profile) render children untouched —
 * those flows are deliberately chrome-free.
 */
export function DashboardShell({
  role,
  exempt,
  children,
}: {
  role: "talent" | "client";
  exempt: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (exempt.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <DashboardSidebar role={role} />
      {/* offset for fixed sidebar (md+) and bottom bar (mobile) */}
      <div className="md:pl-56 lg:pl-60 pb-16 md:pb-0">{children}</div>
    </div>
  );
}

export default DashboardShell;
