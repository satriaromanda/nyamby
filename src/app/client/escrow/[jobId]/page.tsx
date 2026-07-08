import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Icon, Logo } from "@/components/icons";
import EscrowPaymentClient, { PaymentInstructions } from "./escrow-client";

export default async function EscrowPaymentPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await requireAuth();

  if (session.role !== "client") {
    redirect("/login");
  }

  // Fetch job and accepted match
  const job = await prisma.job.findUnique({
    where: { id: jobId, clientUserId: session.userId },
    include: {
      jobMatches: {
        where: { status: "accepted" },
        include: {
          talentProfile: {
            include: { user: { select: { fullName: true } } }
          }
        }
      }
    }
  });

  if (!job) {
    redirect("/client/dashboard");
  }
  const acceptedMatch = job.jobMatches[0];
  if (!acceptedMatch) {
    // No talent accepted yet
    redirect("/client/dashboard");
  }

  // Check if escrow already exists
  const existingEscrow = await prisma.escrowTransaction.findUnique({
    where: { jobId },
    include: { payment: true },
  });

  // Escrow sudah dibayar (held/released/refunded) — tidak ada lagi yang perlu dilakukan di sini
  if (existingEscrow && existingEscrow.status !== "pending") {
    redirect("/client/dashboard");
  }

  const amount = Number(job.budgetMax || job.budgetMin || 0);
  const talentName = acceptedMatch.talentProfile.user.fullName;

  // Escrow pending dengan pembayaran yang masih menunggu — tampilkan instruksi
  // pembayaran yang sama agar client bisa melanjutkan (bukan dead-end redirect)
  const pendingPayment =
    existingEscrow?.status === "pending" &&
    existingEscrow.payment &&
    existingEscrow.payment.status === "PENDING"
      ? existingEscrow.payment
      : null;

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <Link href="/client/dashboard" className="text-sm text-surface-500 hover:text-surface-900">
            Kembali ke Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="card p-8 shadow-xl shadow-trust-500/5 border border-trust-100">
          <div className="w-16 h-16 rounded-2xl bg-trust-50 text-trust-600 flex items-center justify-center mx-auto mb-6">
            <Icon name="shield" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-center text-surface-900 mb-2">
            {pendingPayment ? "Selesaikan Pembayaran" : "Pembayaran Escrow"}
          </h1>
          <p className="text-center text-surface-500 text-sm mb-8">
            Dana Anda akan disimpan dengan aman dan hanya diteruskan ke talenta setelah pekerjaan selesai.
          </p>

          <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 mb-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-surface-200">
              <span className="text-surface-500 text-sm">Project</span>
              <span className="font-semibold text-surface-900 text-sm">{job.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-surface-500 text-sm">Talenta</span>
              <span className="font-semibold text-surface-900 text-sm">{talentName}</span>
            </div>
          </div>

          {pendingPayment ? (
            <PaymentInstructions
              payment={{
                payment_code: pendingPayment.paymentCode,
                payment_code_type: pendingPayment.paymentCodeType,
                redirect_url: pendingPayment.redirectUrl,
                total_amount: Number(pendingPayment.amount),
                platform_fee: Number(existingEscrow!.platformFee),
                amount: Number(existingEscrow!.amount),
              }}
            />
          ) : amount > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6 px-1">
                <span className="text-surface-500 font-medium">Nilai Project (Dana Ditahan)</span>
                <span className="text-2xl font-bold text-trust-600">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </div>
              <EscrowPaymentClient jobId={job.id} amount={amount} />
            </>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 text-center">
              Job ini belum memiliki budget. Lengkapi budget job terlebih dahulu sebelum melakukan pembayaran escrow.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
