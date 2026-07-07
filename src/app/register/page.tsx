"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { useLang } from "@/lib/lang";
import { Navbar } from "@/components/layout/Navbar";

const copy = {
  id: {
    oauthErrors: {
      oauth_role_required: "Pilih role (Talent/Client) dulu sebelum daftar dengan Google/GitHub.",
      oauth_not_configured: "Login Google/GitHub belum dikonfigurasi. Coba daftar dengan email.",
      oauth_invalid_state: "Sesi OAuth tidak valid, silakan coba lagi.",
      oauth_failed: "Gagal daftar dengan provider tersebut. Coba lagi atau gunakan email.",
      oauth_invalid_provider: "Provider OAuth tidak dikenal.",
    } as Record<string, string>,
    errorFallback: "Terjadi kesalahan. Coba lagi.",
    joinTitle: "Bergabung dengan Nyamby",
    joinSub: "Pilih tipe akun yang sesuai dengan kebutuhanmu.",
    talentTitle: "Saya Talenta",
    talentDesc: "Mencari pekerjaan *freelance* dan membangun karir independen.",
    clientTitle: "Saya Klien",
    clientDesc: "Mencari talenta lokal terbaik untuk membantu proyek perusahaan saya.",
    alreadyHaveAccount: "Sudah punya akun?",
    loginNow: "Masuk sekarang",
    changeRole: "Ganti tipe akun",
    talentAccount: "Akun Talenta",
    clientAccount: "Akun Klien",
    talentRegTitle: "Buat akun talenta",
    clientRegTitle: "Daftarkan perusahaan kamu",
    talentRegSub: "Gratis, tanpa kartu kredit. Orientasi cuma 2 menit.",
    clientRegSub: "Mulai rekrut talenta Indonesia dalam hitungan menit.",
    orRegisterEmail: "atau daftar dengan email",
    picName: "Nama PIC (Person in Charge)",
    picPlaceholder: "Budi Santoso",
    fullName: "Nama Lengkap",
    fullNamePlaceholder: "Raka Pratama",
    email: "Email",
    emailTalentPlaceholder: "raka@email.com",
    emailClientPlaceholder: "budi@perusahaan.com",
    password: "Password",
    passwordPlaceholder: "Min. 8 karakter",
    agreePre: "Saya setuju dengan ",
    tnc: "Syarat & Ketentuan",
    agreeMid: " dan ",
    privacy: "Kebijakan Privasi",
    agreePost: " Nyamby.",
    btnTalent: "Daftar & Mulai Orientasi",
    btnClient: "Daftar & Mulai Rekrutmen",
    sparkTalent: "Setelah daftar, kamu akan melalui orientasi 2 menit untuk Nambi mengenal keahlianmu.",
    sparkClient: "Setelah daftar, lengkapi profil perusahaan Anda di proses orientasi untuk mulai memposting pekerjaan.",
  },
  en: {
    oauthErrors: {
      oauth_role_required: "Select a role (Talent/Client) before signing up with Google/GitHub.",
      oauth_not_configured: "Google/GitHub login is not configured. Try signing up with email.",
      oauth_invalid_state: "Invalid OAuth session, please try again.",
      oauth_failed: "Failed to sign up with that provider. Try again or use email.",
      oauth_invalid_provider: "Unknown OAuth provider.",
    } as Record<string, string>,
    errorFallback: "Something went wrong. Try again.",
    joinTitle: "Join Nyamby",
    joinSub: "Choose the account type that fits your needs.",
    talentTitle: "I'm a Talent",
    talentDesc: "Looking for *freelance* work and building an independent career.",
    clientTitle: "I'm a Client",
    clientDesc: "Looking for the best local talent to help with my company's projects.",
    alreadyHaveAccount: "Already have an account?",
    loginNow: "Sign in now",
    changeRole: "Change account type",
    talentAccount: "talent Account",
    clientAccount: "client Account",
    talentRegTitle: "Create talent account",
    clientRegTitle: "Register your company",
    talentRegSub: "Free, no credit card required. Onboarding takes just 2 minutes.",
    clientRegSub: "Start hiring Indonesian talent in minutes.",
    orRegisterEmail: "or sign up with email",
    picName: "PIC Name (Person in Charge)",
    picPlaceholder: "John Doe",
    fullName: "Full Name",
    fullNamePlaceholder: "Jane Doe",
    email: "Email",
    emailTalentPlaceholder: "jane@email.com",
    emailClientPlaceholder: "john@company.com",
    password: "Password",
    passwordPlaceholder: "Min. 8 characters",
    agreePre: "I agree to Nyamby's ",
    tnc: "Terms & Conditions",
    agreeMid: " and ",
    privacy: "Privacy Policy",
    agreePost: ".",
    btnTalent: "Sign Up & Start Onboarding",
    btnClient: "Sign Up & Start Hiring",
    sparkTalent: "After signing up, you'll go through a 2-minute onboarding so Nambi can get to know your skills.",
    sparkClient: "After signing up, complete your company profile in onboarding to start posting jobs.",
  },
} as const;


function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "talent" | "client") || "talent";
  const redirectTo = searchParams.get("redirect");
  
  const [lang] = useLang();
  const t = copy[lang];

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"talent" | "client">(defaultRole);
  
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    industry: "",
    email: "",
    whatsapp_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(t.oauthErrors[searchParams.get("error") || ""] || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build payload dynamically
    const payload: any = {
      role,
      email: form.email,
      password: form.password,
      full_name: form.full_name,
    };

    if (role === "client") {
      // client specific payload modifications if any
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else if (role === "talent") {
        router.push("/talent/onboarding");
      } else {
        router.push("/client/onboarding");
      }
    } catch {
      setError(t.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  const OAuthButtons = () => (
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
  );

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />

      <main role="main" className="flex-1 flex flex-col justify-center w-full max-w-[480px] mx-auto px-6 pt-32 pb-16 animate-scale-in">
        
        {step === 1 && (
          <div className="mt-12 md:mt-0">
            <h1 className="text-3xl font-extrabold text-center mb-2 text-surface-900 tracking-tight" >
              {t.joinTitle}
            </h1>
            <p className="text-surface-500 text-[15px] text-center mb-10">
              {t.joinSub}
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setRole("talent"); setStep(2); }}
                className="w-full bg-white border border-surface-200 rounded-2xl p-6 flex items-start gap-4 hover:border-primary-500 hover:shadow-md transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <Icon name="user" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 mb-1">{t.talentTitle}</h3>
                  <p className="text-sm text-surface-500">{t.talentDesc}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setRole("client"); setStep(2); }}
                className="w-full bg-white border border-surface-200 rounded-2xl p-6 flex items-start gap-4 hover:border-warning-500 hover:shadow-md transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-full bg-warning-50 text-warning-600 flex items-center justify-center flex-shrink-0 group-hover:bg-warning-500 group-hover:text-white transition-colors">
                  <Icon name="building" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900 mb-1">{t.clientTitle}</h3>
                  <p className="text-sm text-surface-500">{t.clientDesc}</p>
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-surface-500 mt-10">
              {t.alreadyHaveAccount}{" "}
              <Link
                href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                className="text-primary-600 hover:text-primary-700 font-bold"
              >
                {t.loginNow}
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2 text-surface-500 hover:text-surface-900 text-sm font-medium mb-8 transition-colors"
            >
              <Icon name="arrowLeft" size={16} /> {t.changeRole}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === "talent" ? "bg-primary-100 text-primary-600" : "bg-warning-100 text-warning-600"}`}>
                <Icon name={role === "talent" ? "user" : "building"} size={20} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${role === "talent" ? "bg-primary-100 text-primary-700" : "bg-warning-100 text-warning-700"}`}>
                {role === "talent" ? t.talentAccount : t.clientAccount}
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight mb-3" >
              {role === "talent" ? t.talentRegTitle : t.clientRegTitle}
            </h1>
            <p className="text-surface-500 text-[16px] mb-8">
              {role === "talent" ? t.talentRegSub : t.clientRegSub}
            </p>

            <OAuthButtons />

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-surface-200"></div>
              <span className="flex-shrink-0 mx-4 text-surface-400 text-xs">{t.orRegisterEmail}</span>
              <div className="flex-grow border-t border-surface-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {role === "client" ? (
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-2">{t.picName}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Icon name="user" size={18} className="text-surface-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                      placeholder={t.picPlaceholder}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
              ) : (
                /* Fields specific to Talent */
                <div>
                  <label className="block text-sm font-semibold text-surface-900 mb-2">{t.fullName}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Icon name="user" size={18} className="text-surface-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                      placeholder={t.fullNamePlaceholder}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-2">{t.email}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="mail" size={18} className="text-surface-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                    placeholder={role === "talent" ? t.emailTalentPlaceholder : t.emailClientPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>



              <div>
                <label className="block text-sm font-semibold text-surface-900 mb-2">{t.password}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="lock" size={18} className="text-surface-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white border border-surface-200 rounded-xl pl-11 pr-12 py-3.5 text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                    placeholder={t.passwordPlaceholder}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
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

              <div className="text-[13px] text-surface-500 mt-2">
                {t.agreePre}<Link href="/terms" className="text-primary-600 hover:underline">{t.tnc}</Link>{t.agreeMid}<Link href="/privacy" className="text-primary-600 hover:underline">{t.privacy}</Link>{t.agreePost}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-400 hover:bg-primary-500 text-white font-semibold py-4 rounded-xl text-base transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    {role === "talent" ? t.btnTalent : t.btnClient}
                    <Icon name="arrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-primary-50 flex items-start gap-3 border border-primary-100">
              <Icon name="spark" size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary-800 leading-relaxed">
                {role === "talent" ? t.sparkTalent : t.sparkClient}
              </p>
            </div>

            <p className="text-center text-sm text-surface-500 mt-8 pb-12">
              {t.alreadyHaveAccount}{" "}
              <Link
                href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
                className="text-primary-600 hover:text-primary-700 font-bold"
              >
                {t.loginNow}
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
