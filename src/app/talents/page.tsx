import Link from "next/link";
import { Prisma, TalentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Icon, Logo } from "@/components/icons";

const categories = [
  { value: "", label: "Semua Talenta" },
  { value: "web_dev", label: "Web Developer" },
  { value: "graphic_designer", label: "Graphic Designer" },
];

export default async function TalentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; skill?: string }>;
}) {
  const filters = await searchParams;
  const category = filters.category || "";
  const skill = filters.skill || "";

  const where: Prisma.TalentProfileWhereInput = {};
  if (category && Object.values(TalentCategory).includes(category as TalentCategory)) {
    where.category = category as TalentCategory;
  }
  if (skill) {
    where.talentSkills = {
      some: { skill: { name: { contains: skill, mode: "insensitive" } } },
    };
  }

  const talents = await prisma.talentProfile.findMany({
    where,
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
      talentSkills: { include: { skill: true } },
      jobMatches: { select: { matchScore: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/jobs" className="text-surface-500 hover:text-surface-900">Browse Jobs</Link>
            <Link href="/how-it-works" className="text-surface-500 hover:text-surface-900">Cara Kerja</Link>
            <Link href="/register?role=client" className="btn-primary text-xs px-4 py-2">Post Job</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] mb-4">
              <span>AI-powered</span>
              <span>Public talent discovery</span>
            </div>
            <h1 className="text-3xl font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
              Browse Talenta
            </h1>
            <p className="text-surface-500">
              Temukan web developer dan graphic designer yang sudah dipetakan skill, rate, dan availability-nya.
            </p>
          </div>

          <form action="/talents" className="flex flex-col sm:flex-row gap-2">
            <select name="category" defaultValue={category} className="input-dark min-w-48">
              {categories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <input
              name="skill"
              defaultValue={skill}
              className="input-dark min-w-56"
              placeholder="Cari skill: React, Figma..."
            />
            <button className="btn-primary px-5 py-3 text-sm" type="submit">
              <span className="inline-flex items-center gap-2">
                <Icon name="search" size={15} />
                Cari Talenta
              </span>
            </button>
          </form>
        </div>

        {talents.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-xl font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
              Belum ada talenta yang cocok
            </h2>
            <p className="text-sm text-surface-500">Coba ubah kategori atau skill pencarian.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {talents.map((talent) => {
              const scores = talent.jobMatches.map((match) => Number(match.matchScore));
              const averageScore = scores.length
                ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
                : null;
              const categoryLabel = talent.category === "web_dev" ? "Web Developer" : "Graphic Designer";

              return (
                <Link key={talent.id} href={`/talents/${talent.id}`} className="glass rounded-2xl p-6 card-hover block">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                        {talent.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={talent.user.avatarUrl} alt={talent.user.fullName} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          talent.user.fullName[0]
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-surface-900">{talent.user.fullName}</h2>
                        <p className="text-xs text-surface-500">{categoryLabel} - {talent.location || "Indonesia"}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full status-${talent.availability}`}>
                      {talent.availability}
                    </span>
                  </div>

                  <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                    {talent.bio || "Talenta Nyamby siap menerima project digital."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {talent.talentSkills.slice(0, 5).map((talentSkill) => (
                      <span key={talentSkill.id} className={`skill-badge skill-badge-${talentSkill.level}`}>
                        {talentSkill.skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#854F0B]">Rate</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="money" size={12} />
                        Rp {Number(talent.ratePerHour || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#534AB7]">AI Match</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="ai" size={12} />
                        {averageScore ? `${averageScore}%` : "Login"}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#0F6E56]">Proof</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="shield" size={12} />
                        {talent.cvText || talent.portfolioContext ? "Enriched" : "Basic"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
