import { DashboardShell } from "@/components/DashboardShell";

// PRD v5.3 §6.12 — shared sidebar layout for all client pages.
// Onboarding and the escrow payment flow stay chrome-free.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="client" exempt={["/client/onboarding", "/client/escrow"]}>
      {children}
    </DashboardShell>
  );
}
