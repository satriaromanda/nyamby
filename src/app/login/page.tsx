"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon, Logo } from "@/components/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  
  const [role, setRole] = useState<"talent" | "client">("talent");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const oauthErrorMessages: Record<string, string> = {
    suspended: "Akun Anda telah disuspend. Hubungi admin untuk informasi lebih lanjut.",
    oauth_role_required: "Pilih role (Talent/Client) dulu sebelum masuk dengan Google/GitHub.",
    oauth_not_configured: "Login Google/GitHub belum dikonfigurasi. Coba masuk dengan email.",
    oauth_invalid_state: "Sesi OAuth tidak valid, silakan coba lagi.",
    oauth_failed: "Gagal masuk dengan provider tersebut. Coba lagi atau gunakan email.",
    oauth_invalid_provider: "Provider OAuth tidak dikenal.",
  };
  const [error, setError] = useState(oauthErrorMessages[searchParams.get("error") || ""] || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }), // Optional: pass role if API cares, though API checks by email
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative px-6 py-24">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Link href="/">
          <Image src="/logo-full.png" alt="Nyamby" width={140} height={40} className="h-8 w-auto object-contain" priority />
        </Link>
      </div>

      <main role="main" className="w-full max-w-[440px] animate-scale-in">
        
        <h1 className="text-4xl font-extrabold text-center mb-3 text-surface-900 tracking-tight" >
          Masuk ke Nyamby
        </h1>
        <p className="text-surface-500 text-[15px] text-center mb-8">
          Lanjutkan perjalanan kariermu bersama Nambi.
        </p>

        {/* Role Toggle */}
        <div className="flex bg-surface-50 p-1 rounded-2xl mb-6 border border-surface-200 shadow-sm">
          <button
            type="button"
            onClick={() => setRole("talent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              role === "talent"
                ? "bg-white text-primary-600 shadow-sm border border-surface-100"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            <Icon name="user" size={18} />
            Saya Talent
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              role === "client"
                ? "bg-white text-surface-900 shadow-sm border border-surface-100"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            <Icon name="building" size={18} />
            Saya Client
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <a
            href={`/api/auth/oauth/google/start?role=${role}`}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-surface-700">Google</span>
          </a>
          <a
            href={`/api/auth/oauth/github/start?role=${role}`}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-surface-700">GitHub</span>
          </a>
        </div>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-surface-200"></div>
          <span className="flex-shrink-0 mx-4 text-surface-400 text-xs">atau login dengan email</span>
          <div className="flex-grow border-t border-surface-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="mail" size={18} className="text-surface-400" />
              </div>
              <input
                type="email"
                className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                placeholder="kamu@email.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="lock" size={18} className="text-surface-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-12 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-surface-600">Ingat saya</span>
            </label>
            <Link href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              Lupa password?
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl text-base transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                Masuk sebagai {role === "talent" ? "Talent" : "Client"}
                <Icon name="arrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts - Keeping for testing purpose but making it subtle */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => { setRole("talent"); setForm({ email: "raka@demo.com", password: "password123" }) }}
            className="text-[10px] text-surface-400 hover:text-primary-600"
          >
            [Demo Talent]
          </button>
          <button
            type="button"
            onClick={() => { setRole("client"); setForm({ email: "budi@demo.com", password: "password123" }) }}
            className="text-[10px] text-surface-400 hover:text-primary-600"
          >
            [Demo Client]
          </button>
        </div>

        <p className="text-center text-sm text-surface-500 mt-8">
          Belum punya akun?{" "}
          <Link
            href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="text-primary-600 hover:text-primary-700 font-bold"
          >
            Daftar gratis
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
