"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { clientOnboardingSchema } from "@/lib/validations";

export default function ClientOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    industry: "",
    company_size: "",
    location: "",
    company_name: "",
    description: "",
    website_url: "",
    whatsapp_number: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const result = clientOnboardingSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Gagal menyimpan data.");
        setLoading(false);
        return;
      }

      router.push("/client/dashboard");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main role="main" className="min-h-screen gradient-hero relative">
      {/* Top Bar for Escaping */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Logo height={32} />
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="text-sm font-medium text-surface-500 hover:text-red-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-surface-200"
        >
          Batalkan & Keluar
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12 relative z-0">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s
                    ? "gradient-primary text-white"
                    : "bg-white border border-surface-200 text-surface-400"
                }`}
              >
                {step > s ? <Icon name="check" size={14} /> : s}
              </div>
              {s < 2 && (
                <div className={`w-12 h-0.5 ${step > s ? "bg-primary-500" : "bg-surface-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] p-8 animate-slide-up">
          {/* Step 1: Industry & Location */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-surface-900">
                Informasi Perusahaan / Pribadi
              </h2>
              <p className="text-surface-500 text-sm mb-8">
                Ceritakan sedikit tentang industrimu untuk membantu kami merekomendasikan talenta.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-surface-600 mb-2">Industri *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: "technology", label: "Teknologi" },
                      { value: "creative", label: "Kreatif & Agensi" },
                      { value: "retail", label: "Retail & E-commerce" },
                      { value: "finance", label: "Keuangan" },
                      { value: "education", label: "Pendidikan" },
                      { value: "other", label: "Lainnya" },
                    ].map((ind) => (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => setForm({ ...form, industry: ind.value })}
                        className={`p-3 text-sm rounded-xl text-center transition-all ${
                          form.industry === ind.value
                            ? "bg-primary-50 border-primary-500 text-primary-700 border-2 font-medium"
                            : "bg-white border border-surface-200 text-surface-600 hover:border-primary-300"
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Ukuran Perusahaan</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["1-10", "11-50", "51-200", "200+"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setForm({ ...form, company_size: size })}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          form.company_size === size
                            ? "bg-surface-100 border border-surface-300 text-surface-900 font-medium"
                            : "bg-white border border-surface-200 text-surface-500 hover:border-surface-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Lokasi Utama (Kota/Negara) *</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Contoh: Jakarta, Indonesia"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.industry || !form.location}
                className="btn-primary w-full py-3 mt-8 disabled:opacity-30 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex items-center justify-center gap-2">Lanjut<Icon name="arrowRight" size={16} /></span>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-surface-900">
                Detail Profil
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                Informasi ini opsional namun sangat membantu membangun kredibilitas di mata talenta.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-600 mb-2">Nama Perusahaan (Bila ada)</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="PT Karya Maju"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Deskripsi Singkat</label>
                  <textarea
                    className="input-dark min-h-[100px] resize-none"
                    placeholder="Kami adalah startup yang bergerak di bidang..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-surface-600 mb-2">Website URL</label>
                    <input
                      type="url"
                      className="input-dark"
                      placeholder="https://company.com"
                      value={form.website_url}
                      onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-600 mb-2">No. WhatsApp</label>
                    <input
                      type="text"
                      className="input-dark"
                      placeholder="081234567890"
                      value={form.whatsapp_number}
                      onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  <span className="inline-flex items-center justify-center gap-2"><Icon name="arrowLeft" size={16} />Kembali</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {loading ? "Menyimpan..." : <span className="inline-flex items-center justify-center gap-2"><Icon name="check" size={16} />Selesai & Masuk Dashboard</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
