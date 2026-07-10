import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getJobCollabAccess } from "@/lib/job-access";
import { Logo } from "@/components/icons";
import { DashboardShell } from "@/components/DashboardShell";
import WorkspaceClient from "./workspace-client";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await requireAuth();

  const access = await getJobCollabAccess(jobId, session.userId);
  if (!access) {
    // Belum ada escrow / bukan peserta → kembali ke dashboard sesuai peran
    redirect(session.role === "talent" ? "/talent/dashboard" : "/client/dashboard");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      title: true,
      status: true,
      client: { select: { fullName: true } },
      escrowTransaction: {
        select: {
          amount: true,
          status: true,
          talent: { select: { fullName: true } },
        },
      },
    },
  });

  if (!job || !job.escrowTransaction) {
    redirect(session.role === "talent" ? "/talent/dashboard" : "/client/dashboard");
  }

  const dashboardHref = access.role === "talent" ? "/talent/dashboard" : "/client/dashboard";
  const counterpartName =
    access.role === "client" ? job.escrowTransaction.talent.fullName : job.client.fullName;

  return (
    <DashboardShell role={session.role as "client" | "talent"} exempt={[]}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
            <p className="text-sm text-surface-500 mt-1">
              Ruang kerja dengan <span className="font-semibold text-surface-700">{counterpartName}</span> · Nilai project Rp{" "}
              {Number(job.escrowTransaction.amount).toLocaleString("id-ID")}
            </p>
          </div>
          <Link href={dashboardHref} className="btn-secondary text-xs sm:text-sm px-4 py-2 shrink-0">
            Kembali ke Dashboard
          </Link>
        </div>

        <WorkspaceClient
          jobId={jobId}
          myRole={access.role}
          initialEscrowHeld={access.escrowHeld}
          jobStatus={job.status}
        />
      </main>
    </DashboardShell>
  );
}
