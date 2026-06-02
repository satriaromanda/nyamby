"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, Logo } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
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

      if (redirectTo) {
        router.push(redirectTo);
      } else if (data.data.user.role === "talent") {
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
      <main role="main" className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Logo height={36} />
        </Link>

        <div className="glass rounded-xl p-8 animate-scale-in">
          <h1 className="text-2xl font-bold text-center mb-2 text-surface-900" >
            Selamat Datang Kembali
          </h1>
          <p className="text-surface-500 text-sm text-center mb-8">
            Masuk ke akun Nyamby-mu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-surface-600 mb-2">Email</label>
              <input
                type="email"
                className="input-dark"
                placeholder="email@contoh.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-2">Password</label>
              <input
                type="password"
                className="input-dark"
                placeholder="Masukkan password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
          <div className="mt-6 p-4 bg-surface-50 rounded-xl border border-surface-200">
            <div className="text-xs text-surface-500 font-medium mb-3 text-center inline-flex items-center justify-center gap-1">
              <Icon name="beaker" size={14} />
              Akun Demo
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: "raka@demo.com", label: "Raka (Talent)" },
                { email: "budi@demo.com", label: "Budi (Client)" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => setForm({ email: demo.email, password: "password123" })}
                  className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-xs text-center"
                >
                  <div className="text-primary-600 font-medium">{demo.label}</div>
                  <div className="text-surface-400 text-[10px]">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-surface-500 mt-6">
            Belum punya akun?{" "}
            <Link
              href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-hero flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
