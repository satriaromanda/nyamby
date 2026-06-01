"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

interface ProfileData {
  profile_id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  bio: string | null;
  category: string;
  rate_per_hour: number | null;
  rate_per_project: number | null;
  availability: string;
  location: string | null;
  portfolio_url: string | null;
  skills: { id: string; name: string; level: string; category: string }[];
}

export default function TalentSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    bio: "",
    rate_per_hour: "",
    rate_per_project: "",
    availability: "available",
    location: "",
    portfolio_url: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/talent/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const d = await res.json();
      if (d.success) {
        setProfile(d.data);
        setForm({
          bio: d.data.bio || "",
          rate_per_hour: d.data.rate_per_hour ? String(d.data.rate_per_hour) : "",
          rate_per_project: d.data.rate_per_project ? String(d.data.rate_per_project) : "",
          availability: d.data.availability || "available",
          location: d.data.location || "",
          portfolio_url: d.data.portfolio_url || "",
        });
      } else if (res.status === 403) {
        router.push("/client/settings");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/talent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: form.bio || null,
          rate_per_hour: form.rate_per_hour ? Number(form.rate_per_hour) : null,
          rate_per_project: form.rate_per_project ? Number(form.rate_per_project) : null,
          availability: form.availability,
          location: form.location || null,
          portfolio_url: form.portfolio_url || null,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("Profil berhasil disimpan!");
      } else {
        showToast(d.message || "Gagal menyimpan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  const categoryLabel = profile.category === "web_dev" ? "Web Developer" : "Graphic Designer";
  const categoryIcon = profile.category === "web_dev" ? "code" : "design";

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Toast */}
      {toast && (
        <div className="toast">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success" ? "bg-accent-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
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
            <Link
              href="/talent/dashboard"
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/jobs"
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              Browse Jobs
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-surface-400 hover:text-surface-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2 text-surface-900"
            style={{ fontFamily: "Outfit" }}
          >
            Pengaturan Profil
          </h1>
          <p className="text-surface-500">Kelola profil dan preferensi akunmu.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Sidebar: Profile Preview ──────────────────── */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="glass rounded-2xl p-6 text-center animate-slide-up">
              <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-primary-500/20">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  profile.full_name[0]
                )}
              </div>
              <h3 className="font-bold text-surface-900 text-lg" style={{ fontFamily: "Outfit" }}>
                {profile.full_name}
              </h3>
              <div className="flex items-center justify-center gap-1.5 mt-1 mb-2">
                <Icon name={categoryIcon} className="text-primary-600" size={15} />
                <span className="text-sm text-surface-500">{categoryLabel}</span>
              </div>
              <p className="text-xs text-surface-400">{profile.email}</p>
              <div className="mt-4 pt-4 border-t border-surface-200">
                <p className="text-[10px] text-surface-400">
                  Bergabung sejak{" "}
                  {new Date(profile.created_at).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Skills Display */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-bold text-sm mb-3 text-surface-900 flex items-center gap-2"><Icon name="spark" size={15} />Skill-mu</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => (
                  <span key={i} className={`skill-badge skill-badge-${s.level}`}>
                    {s.name}
                    <span className="opacity-60 text-[10px] ml-1">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-surface-400 mt-3">
                Skill diatur saat onboarding. Hubungi support untuk perubahan.
              </p>
            </div>

            {/* Public Profile Link */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-bold text-sm mb-2 text-surface-900 flex items-center gap-2"><Icon name="link" size={15} />Profil Publik</h3>
              <Link
                href={`/talents/${profile.profile_id}`}
                className="text-xs text-primary-600 hover:text-primary-700 underline transition-colors"
              >
                Lihat profil publik
              </Link>
            </div>
          </div>

          {/* ─── Main: Edit Form ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <h2 className="font-bold text-lg mb-1 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Informasi Profil
              </h2>
              <p className="text-xs text-surface-400 mb-5">Informasi ini akan terlihat oleh client.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">
                    Bio / Tentang Dirimu
                  </label>
                  <textarea
                    className="input-dark min-h-[120px] resize-none"
                    placeholder="Ceritakan pengalaman dan keahlianmu..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                  <p className="text-[10px] text-surface-400 mt-1">
                    Tip: Jelaskan pengalaman, project menarik, dan apa yang membedakanmu.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Bandung, Indonesia"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    className="input-dark"
                    placeholder="https://github.com/username"
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Rate & Availability */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="font-bold text-lg mb-1 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Rate & Ketersediaan
              </h2>
              <p className="text-xs text-surface-400 mb-5">
                Atur rate dan statusmu agar client tahu kapan kamu bisa dihubungi.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">
                      Rate / Jam (IDR)
                    </label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="75000"
                      value={form.rate_per_hour}
                      onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">
                      Rate / Project (IDR)
                    </label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="2000000"
                      value={form.rate_per_project}
                      onChange={(e) => setForm({ ...form, rate_per_project: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">
                    Status Ketersediaan
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        value: "available",
                        label: "Available",
                        icon: "🟢",
                        desc: "Siap menerima job",
                        activeClass: "border-emerald-400 bg-emerald-50",
                      },
                      {
                        value: "busy",
                        label: "Busy",
                        icon: "🟡",
                        desc: "Sedang ada project",
                        activeClass: "border-amber-400 bg-amber-50",
                      },
                      {
                        value: "unavailable",
                        label: "Unavailable",
                        icon: "🔴",
                        desc: "Tidak tersedia",
                        activeClass: "border-red-400 bg-red-50",
                      },
                    ].map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setForm({ ...form, availability: a.value })}
                        className={`p-3 rounded-xl text-left transition-all border ${
                          form.availability === a.value
                            ? a.activeClass
                            : "border-surface-200 bg-white hover:border-surface-300"
                        }`}
                      >
                        <div className="text-lg mb-1">{a.icon}</div>
                        <div className="text-sm font-medium text-surface-900">{a.label}</div>
                        <div className="text-[10px] text-surface-400">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info (read-only) */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h2 className="font-bold text-lg mb-1 text-surface-900" style={{ fontFamily: "Outfit" }}>
                🔒 Informasi Akun
              </h2>
              <p className="text-xs text-surface-400 mb-5">
                Informasi akun yang tidak dapat diubah.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div>
                    <span className="text-xs text-surface-400">Nama Lengkap</span>
                    <div className="text-sm font-medium text-surface-900">{profile.full_name}</div>
                  </div>
                  <span className="text-[10px] text-surface-400 px-2 py-1 bg-surface-100 rounded-full">
                    Tidak bisa diubah
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div>
                    <span className="text-xs text-surface-400">Email</span>
                    <div className="text-sm font-medium text-surface-900">{profile.email}</div>
                  </div>
                  <span className="text-[10px] text-surface-400 px-2 py-1 bg-surface-100 rounded-full">
                    Tidak bisa diubah
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div>
                    <span className="text-xs text-surface-400">Kategori</span>
                    <div className="text-sm font-medium text-surface-900">
                      {categoryIcon} {categoryLabel}
                    </div>
                  </div>
                  <span className="text-[10px] text-surface-400 px-2 py-1 bg-surface-100 rounded-full">
                    Tidak bisa diubah
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Link href="/talent/dashboard" className="btn-secondary px-6 py-3 text-sm">
                Batal
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-8 py-3 text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Menyimpan...
                  </>
                ) : (
                  <span className="inline-flex items-center gap-2"><Icon name="check" size={15} />Simpan Perubahan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
