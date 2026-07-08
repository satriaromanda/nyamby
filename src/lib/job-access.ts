import { prisma } from "@/lib/prisma";

export type JobAccess = {
  jobId: string;
  clientUserId: string;
  talentUserId: string;
  escrowHeld: boolean;
  jobStatus: string;
  role: "client" | "talent";
};

/**
 * Menentukan apakah user (client pemilik / talenta yang di-hold escrow-nya)
 * berhak mengakses ruang kolaborasi sebuah job.
 *
 * Kolaborasi (chat & progress) hanya terbuka setelah dana escrow ter-hold —
 * memaksa client membayar terlebih dahulu sebelum ada komunikasi kerja.
 *
 * @returns objek akses jika berhak, atau `null` jika tidak.
 */
export async function getJobCollabAccess(
  jobId: string,
  userId: string
): Promise<JobAccess | null> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      clientUserId: true,
      status: true,
      escrowTransaction: {
        select: { talentUserId: true, status: true },
      },
    },
  });

  if (!job || !job.escrowTransaction) return null;

  const escrow = job.escrowTransaction;
  const isClient = job.clientUserId === userId;
  const isTalent = escrow.talentUserId === userId;

  if (!isClient && !isTalent) return null;

  return {
    jobId: job.id,
    clientUserId: job.clientUserId,
    talentUserId: escrow.talentUserId,
    escrowHeld: escrow.status === "held",
    jobStatus: job.status,
    role: isClient ? "client" : "talent",
  };
}
