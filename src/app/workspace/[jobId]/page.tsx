import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getJobCollabAccess } from "@/lib/job-access";
import { Logo } from "@/components/icons";
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
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={30} />
          </Link>
          <Link href={dashboardHref} className="text-sm text-surface-500 hover:text-surface-900">
            Kembali ke Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
          <p className="text-sm text-surface-500 mt-1">
            Ruang kerja dengan {counterpartName} · Nilai project Rp{" "}
            {Number(job.escrowTransaction.amount).toLocaleString("id-ID")}
          </p>
        </div>

        <WorkspaceClient
          jobId={jobId}
          myRole={access.role}
          initialEscrowHeld={access.escrowHeld}
          jobStatus={job.status}
        />
      </main>
    </div>
  );
}
