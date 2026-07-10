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
      requiredSkills: { include: { skill: true } },
      jobMatches: {
        where: { status: "accepted" },
        include: {
          talentProfile: {
            include: { 
              user: { select: { fullName: true } },
              talentSkills: { include: { skill: true } }
            }
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

  // Check existing escrow + payment (PRD v5.3 §6.13):
  // - escrow settled (held/released/...) → back to dashboard
  // - escrow pending with PENDING payment → show payment instructions + Cek Status
  //   (previously this page blindly redirected, leaving the user with NO way to
  //   see or recover a stuck-pending payment in the app)
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          
          {/* Left Column: Detail Project & Talent */}
          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-surface-900 mb-6">
              Detail Project & Talent
            </h1>
            
            <div className="card p-6 shadow-sm border border-surface-200">
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Icon name="briefcase" className="text-primary-600" size={20} />
                Project: {job.title}
              </h2>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap mb-4">
                {job.description}
              </p>
              
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((rs, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-surface-100 text-surface-500 font-medium">
                      {rs.skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 shadow-sm border border-surface-200">
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Icon name="users" className="text-primary-600" size={20} />
                Talenta
              </h2>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {talentName.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <p className="font-semibold text-surface-900 text-base">{talentName}</p>
                   <p className="text-xs text-surface-500 capitalize">{acceptedMatch.talentProfile.category.replace(/_/g, " ")}</p>
                 </div>
              </div>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap mb-4">
                {acceptedMatch.talentProfile.bio || "Belum ada deskripsi profil."}
              </p>
              
              {acceptedMatch.talentProfile.talentSkills && acceptedMatch.talentProfile.talentSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {acceptedMatch.talentProfile.talentSkills.map((ts, i) => (
                    <span key={i} className={`skill-badge skill-badge-${ts.level}`}>
                      {ts.skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Escrow Payment */}
          <div className="lg:col-span-2 sticky top-24">
            <div className="card p-8 shadow-xl shadow-trust-500/5 border border-trust-100">
              <div className="w-12 h-12 rounded-2xl bg-trust-50 text-trust-600 flex items-center justify-center mx-auto mb-4">
                <Icon name="shield" size={24} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-center text-surface-900 mb-2">
                {pendingPayment ? "Selesaikan Pembayaran" : "Pembayaran Escrow"}
              </h2>
              <p className="text-center text-surface-500 text-xs mb-8">
                Dana Anda akan disimpan dengan aman dan hanya diteruskan ke talenta setelah pekerjaan selesai.
              </p>

              {pendingPayment ? (
                <PaymentInstructions
                  jobId={job.id}
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
                    <span className="text-surface-500 font-medium">Nilai Project</span>
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
          </div>
          
        </div>
      </main>
    </div>
  );
}
