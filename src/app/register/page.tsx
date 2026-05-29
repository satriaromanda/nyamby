"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "talent";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: defaultRole,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // Redirect based on role
      if (form.role === "talent") {
        router.push("/talent/onboarding");
      } else {
        router.push("/client/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg" style={{ fontFamily: "Outfit" }}>
            N
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>
            Nyamby
          </span>
        </Link>

        <div className="glass rounded-2xl p-8 animate-scale-in">
          <h1 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "Outfit" }}>
            Buat Akun Baru
          </h1>
          <p className="text-surface-200 text-sm text-center mb-8">
            Mulai journey karirmu bersama Nyamby
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 glass rounded-xl mb-6">
            {[
              { value: "talent", label: "🚀 Talenta", desc: "Cari job & grow" },
              { value: "client", label: "🎯 Client", desc: "Cari talenta" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`p-3 rounded-lg text-center transition-all ${
                  form.role === r.value
                    ? "gradient-primary text-white shadow-lg"
                    : "hover:bg-white/5 text-surface-200"
                }`}
              >
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-200 mb-2">Nama Lengkap</label>
              <input
                type="text"
                className="input-dark"
                placeholder="Contoh: Raka Pratama"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-surface-200 mb-2">Email</label>
              <input
                type="email"
                className="input-dark"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-surface-200 mb-2">Password</label>
              <input
                type="password"
                className="input-dark"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-200 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-hero flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
