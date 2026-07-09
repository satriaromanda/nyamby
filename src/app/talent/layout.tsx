import { DashboardShell } from "@/components/DashboardShell";

// PRD v5.3 §6.12 — shared sidebar layout for all talent pages.
// Onboarding and the public profile page stay chrome-free.
export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="talent" exempt={["/talent/onboarding", "/talent/profile"]}>
      {children}
    </DashboardShell>
  );
}
