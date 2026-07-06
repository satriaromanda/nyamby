import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Icon, RatingStars } from "@/components/icons";
import { AIBadge } from "@/components/AIBadge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function TalentPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  // Accept both UUID and slug
  const talent = await prisma.talentProfile.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
      talentSkills: { include: { skill: true } },
      jobMatches: {
        orderBy: { matchScore: "desc" },
        take: 3,
        include: { job: { select: { title: true } } },
      },
      ratings: {
        include: { client: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" }
      },
    },
  });

  if (!talent) notFound();

  const categoryLabel = talent.category === "web_dev" ? "Web Developer" : "Graphic Designer";
  const redirectPath = `/talents/${talent.id}`;
  const canSeeAi = Boolean(session);

  const reviewCount = talent.ratings.length;
  const averageRating = reviewCount > 0 
    ? talent.ratings.reduce((acc, curr) => acc + curr.score, 0) / reviewCount 
    : 0;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <aside className="space-y-4">
            <div className="card p-6 text-center">
              <div className="w-24 h-24 rounded-full mx-auto gradient-primary flex items-center justify-center text-4xl font-bold text-white mb-4">
                {talent.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={talent.user.avatarUrl} alt={talent.user.fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  talent.user.fullName[0]
                )}
              </div>
              <h1 className="text-2xl font-bold text-surface-900" >
                {talent.user.fullName}
              </h1>
              <p className="text-sm text-surface-500">{categoryLabel}</p>
              <p className="text-xs text-surface-400 mt-1">{talent.location || "Indonesia"}</p>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-sm text-surface-900 mb-3">Info Talenta</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-surface-400">Availability</span>
                  <span className="font-medium text-surface-700">{talent.availability}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-surface-400">Rate/Jam</span>
                  <span className="font-medium text-surface-700">
                    Rp {Number(talent.ratePerHour || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-surface-400">AI Enrichment</span>
                  <span className="font-medium text-money-500">
                    {talent.cvText || talent.portfolioContext ? "Aktif" : "Basic"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-sm text-surface-900 mb-3">Rating & Review</h2>
              <div className="text-center mb-4">
                <RatingStars rating={averageRating} reviewCount={reviewCount} size={16} />
                <p className="text-xs text-surface-400 mt-2">
                  Berdasarkan {reviewCount} ulasan klien
                </p>
              </div>

              {talent.ratings.length > 0 && (
                <div className="space-y-3 mt-4 border-t border-surface-200 pt-4">
                  {talent.ratings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-surface-900">{rating.client.fullName}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rating.score)].map((_, i) => (
                            <Icon key={i} name="star" size={10} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-xs text-surface-600 leading-relaxed italic">"{rating.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="lg:col-span-2 space-y-5">
            <div className="card p-7">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-surface-900" >
                  Profil Publik
                </h2>
                <AIBadge />
              </div>
              <p className="text-sm text-surface-600 leading-relaxed">
                {talent.bio || "Talenta ini belum menulis bio, tetapi skill dan availability sudah tersedia untuk dieksplorasi."}
              </p>
              {talent.portfolioUrl && (
                <a href={talent.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-sm text-primary-600 hover:underline">
                  <Icon name="external" size={14} />
                  Buka portfolio
                </a>
              )}
            </div>

            <div className="card p-7">
              <h2 className="text-lg font-bold text-surface-900 mb-4" >
                Skill Map
              </h2>
              <div className="flex flex-wrap gap-2">
                {talent.talentSkills.map((talentSkill) => (
                  <span key={talentSkill.id} className={`skill-badge skill-badge-${talentSkill.level}`}>
                    {talentSkill.skill.name}
                    <span className="opacity-60 text-[10px]">{talentSkill.level}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-7 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-surface-900" >
                  AI Match Signals
                </h2>
                <AIBadge label="AI-powered" />
              </div>

              <div className={canSeeAi ? "space-y-3" : "space-y-3 blur-sm select-none pointer-events-none"}>
                {(talent.jobMatches.length > 0 ? talent.jobMatches : [null, null, null]).map((match, index) => (
                  <div key={match?.id || index} className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-surface-900">
                          {match?.job.title || "Landing Page UKM"}
                        </div>
                        <div className="text-xs text-surface-400">
                          {match?.reasoning || "AI menilai kecocokan berdasarkan skill, CV, dan portfolio."}
                        </div>
                      </div>
                      <span className="badge-match shrink-0">
                        <Icon name="ai" size={12} />
                        {match ? `${Math.round(Number(match.matchScore))}%` : "87%"} Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {!canSeeAi && (
                <div className="absolute inset-x-6 bottom-6 p-4 rounded-xl bg-white/95 border border-surface-200 text-center shadow-lg">
                  <div className="text-sm font-semibold text-surface-900 mb-1 flex items-center justify-center gap-2">
                    <Icon name="lock" size={15} />
                    Login untuk lihat Match Score
                  </div>
                  <p className="text-xs text-surface-500 mb-3">AI reasoning dan score hanya dibuka setelah user masuk.</p>
                  <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="btn-primary text-xs px-4 py-2 inline-block">
                    Login untuk kontak talenta
                  </Link>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Link href={`/register?role=client&redirect=${encodeURIComponent(redirectPath)}`} className="btn-primary text-sm">
                <span className="inline-flex items-center gap-2">
                  <Icon name="user" size={15} />
                  Hubungi & Konfirmasi Talenta
                </span>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
