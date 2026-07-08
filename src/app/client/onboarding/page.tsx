"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { clientOnboardingSchema } from "@/lib/validations";

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  indonesia: "IDR",
  malaysia: "MYR",
  singapore: "SGD",
  other: "USD",
};

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
    country: "indonesia",
    preferred_currency: "IDR",
  });

  const totalSteps = form.country !== "indonesia" ? 3 : 2;
  const isExportClient = form.country !== "indonesia";

  const handleCountryChange = (country: string) => {
    setForm({
      ...form,
      country,
      preferred_currency: COUNTRY_CURRENCY_MAP[country] || "USD",
    });
  };

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

      router.push(data.data?.redirect || "/client/dashboard");
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
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
              {s < totalSteps && (
                <div className={`w-12 h-0.5 ${step > s ? "bg-primary-500" : "bg-surface-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8 animate-slide-up">
          {/* Step 1: Industry, Location & Country */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-surface-900">
                Informasi Perusahaan / Pribadi
              </h2>
              <p className="text-surface-500 text-sm mb-8">
                Ceritakan sedikit tentang industrimu untuk membantu kami merekomendasikan talenta.
              </p>

              <div className="space-y-6">
                {/* Country Selector — PRD v4.0 */}
                <div>
                  <label className="block text-sm text-surface-600 mb-2">Negara / Country *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "indonesia", label: "🇮🇩 Indonesia" },
                      { value: "malaysia", label: "🇲🇾 Malaysia" },
                      { value: "singapore", label: "🇸🇬 Singapore" },
                      { value: "other", label: "🌏 Other" },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleCountryChange(c.value)}
                        className={`p-3 text-sm rounded-xl text-center transition-all ${
                          form.country === c.value
                            ? "bg-primary-50 border-primary-500 text-primary-700 border-2 font-medium"
                            : "bg-white border border-surface-200 text-surface-600 hover:border-primary-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {isExportClient && (
                    <p className="mt-2 text-xs text-primary-600 flex items-center gap-1">
                      <Icon name="info" size={12} />
                      Business verification will be required after onboarding
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Industri / Industry *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: "technology", label: isExportClient ? "Technology" : "Teknologi" },
                      { value: "creative", label: isExportClient ? "Creative & Agency" : "Kreatif & Agensi" },
                      { value: "retail", label: isExportClient ? "Retail & E-commerce" : "Retail & E-commerce" },
                      { value: "finance", label: isExportClient ? "Finance" : "Keuangan" },
                      { value: "education", label: isExportClient ? "Education" : "Pendidikan" },
                      { value: "other", label: isExportClient ? "Other" : "Lainnya" },
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
                  <label className="block text-sm text-surface-600 mb-2">
                    {isExportClient ? "Company Size" : "Ukuran Perusahaan"}
                  </label>
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
                  <label className="block text-sm text-surface-600 mb-2">
                    {isExportClient ? "Location (City/Country) *" : "Lokasi Utama (Kota/Negara) *"}
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder={isExportClient ? "e.g. Kuala Lumpur, Malaysia" : "Contoh: Jakarta, Indonesia"}
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
                <span className="inline-flex items-center justify-center gap-2">
                  {isExportClient ? "Next" : "Lanjut"}
                  <Icon name="arrowRight" size={16} />
                </span>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-surface-900">
                {isExportClient ? "Profile Details" : "Detail Profil"}
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                {isExportClient
                  ? "Optional info that helps build credibility with talent."
                  : "Informasi ini opsional namun sangat membantu membangun kredibilitas di mata talenta."}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-600 mb-2">
                    {isExportClient ? "Company Name (if applicable)" : "Nama Perusahaan (Bila ada)"}
                  </label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder={isExportClient ? "Acme Sdn Bhd" : "PT Karya Maju"}
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">
                    {isExportClient ? "Short Description" : "Deskripsi Singkat"}
                  </label>
                  <textarea
                    className="input-dark min-h-[100px] resize-none"
                    placeholder={isExportClient ? "We are a startup focused on..." : "Kami adalah startup yang bergerak di bidang..."}
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
                    <label className="block text-sm text-surface-600 mb-2">
                      {isExportClient ? "Phone / WhatsApp" : "No. WhatsApp"}
                    </label>
                    <input
                      type="text"
                      className="input-dark"
                      placeholder={isExportClient ? "+60123456789" : "081234567890"}
                      value={form.whatsapp_number}
                      onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                    />
                  </div>
                </div>

                {/* Currency indicator for export clients */}
                {isExportClient && (
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <p className="text-sm text-primary-700 font-medium flex items-center gap-2">
                      <Icon name="money" size={16} />
                      Your preferred currency: <strong>{form.preferred_currency}</strong>
                    </p>
                    <p className="text-xs text-primary-600 mt-1">
                      Job budgets will be displayed in {form.preferred_currency}. All transactions are processed securely via escrow.
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Icon name="arrowLeft" size={16} />
                    {isExportClient ? "Back" : "Kembali"}
                  </span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {loading ? (isExportClient ? "Saving..." : "Menyimpan...") : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Icon name="check" size={16} />
                      {isExportClient ? "Complete & Enter Dashboard" : "Selesai & Masuk Dashboard"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
