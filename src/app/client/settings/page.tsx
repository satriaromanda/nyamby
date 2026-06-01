"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";


interface ClientProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  stats: {
    total_jobs: number;
    active_jobs: number;
    completed_jobs: number;
  };
}

export default function ClientSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    full_name: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/client/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const d = await res.json();
      if (d.success) {
        setProfile(d.data);
        setForm({
          full_name: d.data.full_name || "",
        });
      } else if (res.status === 403) {
        router.push("/talent/settings");
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
    if (!form.full_name.trim()) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
        }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("Profil berhasil disimpan!");
        fetchProfile();
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
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/client/dashboard"
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/client/post-job"
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              Post Job
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-surface-400 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
          <p className="text-surface-500">Kelola profil dan preferensi akun client-mu.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Sidebar: Profile Preview & Stats ──────────── */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="glass rounded-xl p-6 text-center animate-slide-up">
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
              <h3
                className="font-bold text-surface-900 text-lg"
                style={{ fontFamily: "Outfit" }}
              >
                {profile.full_name}
              </h3>
              <div className="flex items-center justify-center gap-1.5 mt-1 mb-2">
                <Icon name="user" className="text-primary-600" size={15} />
                <span className="text-sm text-surface-500">Client</span>
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

            {/* Stats Card */}
            <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-bold text-sm mb-4 text-surface-900 flex items-center gap-2"><Icon name="chart" size={15} />Statistik</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Job Diposting", value: profile.stats.total_jobs, icon: "file" as const },
                  { label: "Job Aktif", value: profile.stats.active_jobs, icon: "check" as const },
                  { label: "Job Selesai", value: profile.stats.completed_jobs, icon: "check" as const },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={stat.icon} className="text-primary-600" size={15} />
                      <span className="text-xs text-surface-500">{stat.label}</span>
                    </div>
                    <span
                      className="text-lg font-bold text-surface-900"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-bold text-sm mb-3 text-surface-900"><Icon name="bolt" className="inline mr-1.5 text-action-500" size={15} />Aksi Cepat</h3>
              <div className="space-y-2">
                <Link
                  href="/client/post-job"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-primary-200 transition-colors group"
                >
                  <Icon name="plus" className="text-action-500" size={16} />
                  <span className="text-xs text-surface-600 group-hover:text-primary-600 transition-colors">
                    Post Job Baru
                  </span>
                </Link>
                <Link
                  href="/client/dashboard"
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-primary-200 transition-colors group"
                >
                  <Icon name="chart" className="text-primary-600" size={16} />
                  <span className="text-xs text-surface-600 group-hover:text-primary-600 transition-colors">
                    Lihat Dashboard
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Main: Edit Form ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable Info */}
            <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
              <h2
                className="font-bold text-lg mb-1 text-surface-900"
                style={{ fontFamily: "Outfit" }}
              >
                <Icon name="user" className="inline mr-1.5 text-primary-600" size={20} />Informasi Profil
              </h2>
              <p className="text-xs text-surface-400 mb-5">
                Perbarui informasi profil client-mu.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">
                    Nama Lengkap / Perusahaan
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="PT Karya Digital Indonesia"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                  <p className="text-[10px] text-surface-400 mt-1">
                    Nama ini akan terlihat oleh talenta saat mereka melihat job posting-mu.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Info (read-only) */}
            <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2
                className="font-bold text-lg mb-1 text-surface-900"
                style={{ fontFamily: "Outfit" }}
              >
                <Icon name="lock" className="inline mr-1.5 text-trust-500" size={20} />Informasi Akun
              </h2>
              <p className="text-xs text-surface-400 mb-5">
                Informasi akun yang tidak dapat diubah.
              </p>

              <div className="space-y-3">
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
                    <span className="text-xs text-surface-400">Role</span>
                    <div className="text-sm font-medium text-surface-900"><Icon name="briefcase" className="inline mr-1 text-primary-600" size={14} />Client</div>
                  </div>
                  <span className="text-[10px] text-surface-400 px-2 py-1 bg-surface-100 rounded-full">
                    Tidak bisa diubah
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h2
                className="font-bold text-lg mb-1 text-surface-900"
                style={{ fontFamily: "Outfit" }}
              >
                <Icon name="external" className="inline mr-1.5 text-primary-600" size={20} />Tentang Platform
              </h2>
              <p className="text-xs text-surface-400 mb-5">
                Informasi penting tentang cara kerja Nyamby.
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: "ai" as const,
                    title: "AI Job Matching",
                    desc: "Setiap kali kamu post job, AI kami otomatis mencocokkan dengan talenta terbaik di platform.",
                  },
                  {
                    icon: "money" as const,
                    title: "Escrow Payment",
                    desc: "Dana ditahan secara aman dan dirilis ke talenta setelah pekerjaan disetujui.",
                  },
                  {
                    icon: "lock" as const,
                    title: "Keamanan Data",
                    desc: "Semua data dienkripsi dan disimpan dengan standar keamanan tinggi.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200"
                  >
                    <Icon name={item.icon} className="shrink-0 text-primary-600" size={18} />
                    <div>
                      <div className="text-sm font-medium text-surface-900">{item.title}</div>
                      <div className="text-xs text-surface-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Link href="/client/dashboard" className="btn-secondary px-6 py-3 text-sm">
                Batal
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-8 py-3 text-sm disabled:opacity-50 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
