"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface TalentSkill {
  name: string;
  level: string;
  category: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  category: string;
  rate_per_hour: number | null;
  rate_per_project: number | null;
  availability: string;
  location: string | null;
  portfolio_url: string | null;
  skills: TalentSkill[];
}

export default function TalentProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/talent/profile/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.data);
        } else {
          setError(d.message || "Profil tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
            Profil Tidak Ditemukan
          </h2>
          <p className="text-surface-500 text-sm mb-6">{error}</p>
          <Link href="/" className="btn-primary text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const availConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
    available: { color: "text-accent-600", bg: "bg-emerald-50", label: "Tersedia", dot: "bg-accent-500" },
    busy: { color: "text-amber-600", bg: "bg-amber-50", label: "Sibuk", dot: "bg-amber-500" },
    unavailable: { color: "text-red-500", bg: "bg-red-50", label: "Tidak Tersedia", dot: "bg-red-500" },
  };

  const avail = availConfig[profile.availability] || availConfig.available;

  const categoryLabel = profile.category === "web_dev" ? "Web Developer" : "Graphic Designer";
  const categoryIcon = profile.category === "web_dev" ? "💻" : "🎨";

  const skillsByCategory = profile.skills.reduce<Record<string, TalentSkill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const levelOrder = { expert: 0, intermediate: 1, beginner: 2 };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm text-white"
              style={{ fontFamily: "Outfit" }}
            >
              N
            </div>
            <span className="font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>
              Nyamby
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Browse Jobs
            </Link>
            <Link href="/login" className="btn-primary text-xs px-4 py-2">
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-purple-400/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12">
          <div className="flex flex-col md:flex-row items-start gap-8 animate-slide-up">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-3xl gradient-primary flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-primary-500/20 animate-pulse-glow">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full rounded-3xl object-cover"
                  />
                ) : (
                  profile.full_name[0]
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900" style={{ fontFamily: "Outfit" }}>
                  {profile.full_name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${avail.bg} ${avail.color}`}>
                  <span className={`w-2 h-2 rounded-full ${avail.dot} animate-pulse`} />
                  {avail.label}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{categoryIcon}</span>
                <span className="text-surface-600 font-medium">{categoryLabel}</span>
                {profile.location && (
                  <>
                    <span className="text-surface-300">•</span>
                    <span className="text-surface-500 text-sm">📍 {profile.location}</span>
                  </>
                )}
              </div>

              {profile.bio && (
                <p className="text-surface-500 leading-relaxed max-w-2xl text-sm md:text-base">
                  {profile.bio}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                {profile.rate_per_hour && (
                  <div className="glass rounded-xl px-5 py-3">
                    <div className="text-xs text-surface-400 mb-0.5">Rate / Jam</div>
                    <div className="text-lg font-bold gradient-text" style={{ fontFamily: "Outfit" }}>
                      Rp {Number(profile.rate_per_hour).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
                {profile.rate_per_project && (
                  <div className="glass rounded-xl px-5 py-3">
                    <div className="text-xs text-surface-400 mb-0.5">Rate / Project</div>
                    <div className="text-lg font-bold gradient-text" style={{ fontFamily: "Outfit" }}>
                      Rp {Number(profile.rate_per_project).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
                <div className="glass rounded-xl px-5 py-3">
                  <div className="text-xs text-surface-400 mb-0.5">Total Skills</div>
                  <div className="text-lg font-bold text-primary-600" style={{ fontFamily: "Outfit" }}>
                    {profile.skills.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Left: Skills ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
                ⚡ Skill Map
              </h2>

              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <div className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-3">
                      {category}
                    </div>
                    <div className="space-y-2">
                      {skills
                        .sort((a, b) => (levelOrder[a.level as keyof typeof levelOrder] ?? 1) - (levelOrder[b.level as keyof typeof levelOrder] ?? 1))
                        .map((skill, i) => (
                          <SkillBar key={i} name={skill.name} level={skill.level} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Badges Summary */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-bold text-sm mb-4 text-surface-900">Semua Skill</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills
                  .sort((a, b) => (levelOrder[a.level as keyof typeof levelOrder] ?? 1) - (levelOrder[b.level as keyof typeof levelOrder] ?? 1))
                  .map((s, i) => (
                    <span key={i} className={`skill-badge skill-badge-${s.level}`}>
                      {s.name}
                      <span className="opacity-60 text-[10px] ml-1">
                        {s.level === "expert" ? "★★★" : s.level === "intermediate" ? "★★" : "★"}
                      </span>
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* ─── Right: Sidebar ──────────────────────── */}
          <div className="space-y-6">
            {/* Portfolio */}
            {profile.portfolio_url && (
              <div className="glass rounded-2xl p-6 card-hover animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-surface-900">
                  🔗 Portfolio
                </h3>
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-primary-200 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm text-white shrink-0">
                    {profile.portfolio_url.includes("github") ? "🐙" :
                     profile.portfolio_url.includes("behance") ? "🅱️" :
                     profile.portfolio_url.includes("dribbble") ? "🏀" : "🌐"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors truncate">
                      {profile.portfolio_url.replace(/^https?:\/\//, "")}
                    </div>
                    <div className="text-[10px] text-surface-400">Klik untuk membuka</div>
                  </div>
                  <svg className="w-4 h-4 text-surface-400 group-hover:text-surface-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Skill Level Legend */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-bold text-sm mb-4 text-surface-900">📊 Level Guide</h3>
              <div className="space-y-3">
                {[
                  { level: "Expert", color: "bg-primary-500", textColor: "text-primary-600", desc: "Menguasai mendalam, bisa mengajar" },
                  { level: "Intermediate", color: "bg-accent-500", textColor: "text-accent-600", desc: "Kompeten, pengalaman di project" },
                  { level: "Beginner", color: "bg-amber-500", textColor: "text-amber-600", desc: "Paham dasar, sedang belajar" },
                ].map((item) => (
                  <div key={item.level} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1 shrink-0`} />
                    <div>
                      <div className={`text-sm font-semibold ${item.textColor}`}>{item.level}</div>
                      <div className="text-[11px] text-surface-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dummy Rating */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-surface-900">
                ⭐ Rating & Reputasi
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "text-amber-400" : "text-amber-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>4.8</span>
                <span className="text-xs text-surface-400">(12 reviews)</span>
              </div>
              <div className="space-y-1.5 mt-3">
                {[
                  { label: "Kualitas", value: 95 },
                  { label: "Komunikasi", value: 90 },
                  { label: "Tepat Waktu", value: 88 },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-surface-500 w-20">{metric.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-1000"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-surface-500 w-8 text-right">{metric.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="text-2xl mb-3">🤝</div>
              <h3 className="font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Tertarik dengan talenta ini?
              </h3>
              <p className="text-xs text-surface-400 mb-4">
                Post job dan AI kami akan otomatis mencocokkan kebutuhanmu.
              </p>
              <Link href="/register?role=client" className="btn-primary text-sm w-full inline-block py-3">
                Post Job Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-200 py-8 mt-8 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center font-bold text-xs text-white" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="text-sm font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>Nyamby</span>
          </div>
          <span className="text-xs text-surface-400">© 2026 Nyamby — AI Career Platform</span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Skill Bar Component ──────────────────────────────────────── */

function SkillBar({ name, level }: { name: string; level: string }) {
  const config: Record<string, { width: string; color: string; gradient: string }> = {
    expert: { width: "90%", color: "text-primary-600", gradient: "from-primary-500 to-purple-500" },
    intermediate: { width: "60%", color: "text-accent-600", gradient: "from-accent-500 to-teal-400" },
    beginner: { width: "30%", color: "text-amber-600", gradient: "from-amber-500 to-orange-400" },
  };

  const cfg = config[level] || config.intermediate;

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm font-medium truncate text-surface-700">{name}</div>
      <div className="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-1000 ease-out`}
          style={{ width: cfg.width }}
        />
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wide w-20 text-right ${cfg.color}`}>
        {level}
      </span>
    </div>
  );
}
