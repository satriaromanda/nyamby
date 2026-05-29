"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
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
      if (data.data.user.role === "talent") {
        router.push("/talent/dashboard");
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
            Selamat Datang Kembali
          </h1>
          <p className="text-surface-200 text-sm text-center mb-8">
            Masuk ke akun Nyamby-mu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
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
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 glass rounded-xl">
            <div className="text-xs text-surface-200 font-medium mb-3 text-center">🧪 Akun Demo</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: "raka@demo.com", label: "Raka (Talent)" },
                { email: "budi@demo.com", label: "Budi (Client)" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => setForm({ email: demo.email, password: "password123" })}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-xs text-center"
                >
                  <div className="text-primary-300 font-medium">{demo.label}</div>
                  <div className="text-surface-200 text-[10px]">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-surface-200 mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
