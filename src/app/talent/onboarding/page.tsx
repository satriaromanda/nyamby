"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { AIBadge } from "@/components/AIBadge";
import { SmartPricingCard } from "@/components/SmartPricingCard";

interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [uploadWarning, setUploadWarning] = useState("");

  const [form, setForm] = useState({
    bio: "",
    category: "" as string,
    rate_per_hour: "",
    rate_per_project: "",
    availability: "available",
    location: "",
    portfolio_url: "",
    bank_code: "",
    bank_account: "",
    bank_account_name: "",
    skills: [] as { skill_id: string; level: string; name: string }[],
  });

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllSkills(d.data);
      });
  }, []);

  const filteredSkills = allSkills.filter((s) => {
    if (form.category === "web_dev") {
      return ["Frontend", "Backend", "Database", "DevOps"].includes(s.category);
    }
    if (form.category === "graphic_designer") {
      return ["Design Tool", "Design"].includes(s.category);
    }
    return true;
  });

  const toggleSkill = (skill: Skill) => {
    const exists = form.skills.find((s) => s.skill_id === skill.id);
    if (exists) {
      setForm({
        ...form,
        skills: form.skills.filter((s) => s.skill_id !== skill.id),
      });
    } else {
      setForm({
        ...form,
        skills: [...form.skills, { skill_id: skill.id, level: "intermediate", name: skill.name }],
      });
    }
  };

  const updateSkillLevel = (skillId: string, level: string) => {
    setForm({
      ...form,
      skills: form.skills.map((s) =>
        s.skill_id === skillId ? { ...s, level } : s
      ),
    });
  };

  const handleSubmit = async () => {
    if (!form.bank_code || !form.bank_account) {
      setError("Data rekening bank wajib diisi agar kamu bisa menerima pembayaran dari client.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      setAiLoading(true);
      const payload = new FormData();
      payload.set("bio", form.bio);
      payload.set("category", form.category);
      payload.set("rate_per_hour", form.rate_per_hour);
      payload.set("rate_per_project", form.rate_per_project);
      payload.set("availability", form.availability);
      payload.set("location", form.location);
      payload.set("portfolio_url", form.portfolio_url);
      payload.set(
        "skills",
        JSON.stringify(form.skills.map((s) => ({ skill_id: s.skill_id, level: s.level })))
      );
      if (form.bank_code) payload.set("bank_code", form.bank_code);
      if (form.bank_account) payload.set("bank_account", form.bank_account);
      if (form.bank_account_name) payload.set("bank_account_name", form.bank_account_name);
      if (cvFile) payload.set("cv_file", cvFile);
      if (portfolioFile) payload.set("portfolio_file", portfolioFile);

      const res = await fetch("/api/talent/onboarding", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        setAiLoading(false);
        return;
      }
      if (data.data?.upload_warning) setUploadWarning(data.data.upload_warning);

      // Show AI loading animation for a moment
      setTimeout(() => {
        setAiLoading(false);
        router.push("/talent/dashboard");
      }, 2000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setAiLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (aiLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center text-4xl text-white animate-pulse-glow">
            <Icon name="ai" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-surface-900" >
            AI sedang menganalisis profilmu...
          </h2>
          <p className="text-surface-500 text-sm mb-6">
            Mencocokkan skill-mu dengan demand pasar saat ini
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    );
  }

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
          {[1, 2, 3].map((s) => (
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
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? "bg-primary-500" : "bg-surface-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8 animate-slide-up">
          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-surface-900" >
                Pilih Kategorimu
              </h2>
              <p className="text-surface-500 text-sm mb-8">
                Kategori apa yang paling menggambarkan keahlianmu?
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "web_dev", label: "Web Developer", icon: "code" as const, desc: "Frontend, Backend, Full-stack" },
                  { value: "graphic_designer", label: "Graphic Designer", icon: "design" as const, desc: "UI/UX, Branding, Visual" },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value, skills: [] })}
                    className={`p-6 rounded-xl text-left transition-all card-hover ${
                      form.category === cat.value
                        ? "gradient-primary shadow-lg text-white"
                        : "bg-white border border-surface-200 hover:border-primary-200 hover:shadow-md"
                    }`}
                  >
                    <Icon name={cat.icon} className="mb-3" size={30} />
                    <div className={`font-bold mb-1 ${form.category === cat.value ? "text-white" : "text-surface-900"}`}>{cat.label}</div>
                    <div className="text-xs opacity-70">{cat.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => form.category && setStep(2)}
                disabled={!form.category}
                className="btn-primary w-full py-3 disabled:opacity-30 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <span className="inline-flex items-center justify-center gap-2">Lanjut<Icon name="arrowRight" size={16} /></span>
              </button>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-surface-900" >
                Pilih Skill-mu
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                Pilih skill yang kamu kuasai dan tentukan levelnya
              </p>

              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                {filteredSkills.map((skill) => {
                  const selected = form.skills.find((s) => s.skill_id === skill.id);
                  return (
                    <div
                      key={skill.id}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        selected ? "bg-primary-50 border border-primary-200" : "bg-white border border-surface-200 hover:border-primary-200"
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                            selected ? "bg-primary-500 text-white" : "border border-surface-300"
                          }`}>
                            {selected && <Icon name="check" size={12} />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-surface-900">{skill.name}</div>
                            <div className="text-xs text-surface-400">{skill.category}</div>
                          </div>
                        </div>
                        {selected && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {["beginner", "intermediate", "expert"].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => updateSkillLevel(skill.id, lvl)}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                                  selected.level === lvl
                                    ? lvl === "expert"
                                      ? "bg-primary-100 text-primary-700"
                                      : lvl === "intermediate"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    : "text-surface-400 hover:bg-surface-100"
                                }`}
                              >
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-surface-400 mb-4">
                {form.skills.length} skill dipilih
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  <span className="inline-flex items-center justify-center gap-2"><Icon name="arrowLeft" size={16} />Kembali</span>
                </button>
                <button
                  onClick={() => form.skills.length > 0 && setStep(3)}
                  disabled={form.skills.length === 0}
                  className="btn-primary flex-1 py-3 disabled:opacity-30 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <span className="inline-flex items-center justify-center gap-2">Lanjut<Icon name="arrowRight" size={16} /></span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-surface-900" >
                Detail Profilmu
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                Lengkapi informasi untuk meningkatkan peluang match-mu
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-600 mb-2">Bio / Tentang Dirimu</label>
                  <textarea
                    className="input-dark min-h-[100px] resize-none"
                    placeholder="Ceritakan pengalaman dan keahlianmu..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <SmartPricingCard
                      category={form.category}
                      skills={form.skills.map((s) => s.name)}
                      level={
                        form.skills.some((s) => s.level === "expert")
                          ? "expert"
                          : form.skills.some((s) => s.level === "intermediate")
                            ? "intermediate"
                            : "beginner"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-600 mb-2">Rate / Jam (IDR)</label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="75000"
                      value={form.rate_per_hour}
                      onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-600 mb-2">Rate / Project (IDR)</label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="2000000"
                      value={form.rate_per_project}
                      onChange={(e) => setForm({ ...form, rate_per_project: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Lokasi</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Bandung"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-surface-600 mb-2">
                    <Icon name="link" className="text-[#0F6E56]" size={15} />
                    Portfolio URL
                    <AIBadge className="px-2 py-0.5" />
                  </label>
                  <input
                    type="url"
                    className="input-dark"
                    placeholder={form.category === "graphic_designer" ? "https://behance.net/username" : "https://github.com/username"}
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                    autoComplete="url"
                  />
                  <p className="mt-2 text-[10px] text-surface-400">
                    {form.category === "graphic_designer"
                      ? "Behance, Dribbble, Figma, atau portofolio desain lainnya."
                      : "GitHub, GitLab, website pribadi, atau portofolio kode."}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-surface-200">
                    <label className="flex items-center justify-between gap-2 text-sm text-surface-700 mb-3">
                      <span className="flex items-center gap-2">
                        <Icon name="upload" className="text-[#0F6E56]" size={15} />
                        CV PDF
                      </span>
                      <AIBadge className="px-2 py-0.5" />
                    </label>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="block w-full text-xs text-surface-500 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-700"
                      onChange={(event) => setCvFile(event.target.files?.[0] || null)}
                    />
                    <p className="mt-2 text-[10px] text-surface-400">
                      Opsional, maksimal 5MB. Dipakai sebagai bukti pengalaman.
                    </p>
                    {cvFile && (
                      <div className="mt-2 text-[10px] text-[#3B6D11]">
                        CV siap diproses: {cvFile.name}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-surface-200">
                    <label className="flex items-center justify-between gap-2 text-sm text-surface-700 mb-3">
                      <span className="flex items-center gap-2">
                        <Icon name="upload" className="text-[#0F6E56]" size={15} />
                        Portfolio File
                      </span>
                      <AIBadge className="px-2 py-0.5" />
                    </label>
                    <input
                      type="file"
                      accept={form.category === "graphic_designer" ? "application/pdf,.pdf,application/zip,.zip,image/png,image/jpeg,image/webp" : "application/pdf,.pdf,application/zip,.zip"}
                      className="block w-full text-xs text-surface-500 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-700"
                      onChange={(event) => setPortfolioFile(event.target.files?.[0] || null)}
                    />
                    <p className="mt-2 text-[10px] text-surface-400">
                      {form.category === "graphic_designer"
                        ? "Opsional, PDF/ZIP/PNG/JPG maksimal 10MB. Upload portofolio desainmu."
                        : "Opsional, PDF/ZIP maksimal 10MB. Bisa digabung dengan URL."}
                    </p>
                    {portfolioFile && (
                      <div className="mt-2 text-[10px] text-[#3B6D11]">
                        Portofolio siap diproses: {portfolioFile.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Account Section — PRD v3.0 §9.2 */}
                <div className="p-4 rounded-xl bg-white border border-surface-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
                    <Icon name="money" className="text-[#0F6E56]" size={15} />
                    Data Rekening Bank
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Untuk pembayaran
                    </span>
                  </label>
                  <p className="text-[10px] text-surface-400 mb-3">
                    Wajib diisi agar kamu bisa menerima pembayaran dari client melalui escrow.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-surface-500 mb-1">Bank / E-Wallet <span className="text-red-500">*</span></label>
                      <select
                        className="input-dark text-sm"
                        value={form.bank_code}
                        onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                      >
                        <option value="">Pilih bank atau e-wallet...</option>
                        <option value="BCA">BCA</option>
                        <option value="BNI">BNI</option>
                        <option value="MANDIRI">Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="GOPAY">GoPay</option>
                        <option value="OVO">OVO</option>
                        <option value="DANA">DANA</option>
                        <option value="SHOPEEPAY">ShopeePay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-surface-500 mb-1">Nomor Rekening / HP <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder={form.bank_code && ["GOPAY", "OVO", "DANA", "SHOPEEPAY"].includes(form.bank_code) ? "08xxxxxxxxxx" : "1234567890"}
                        value={form.bank_account}
                        onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-surface-500 mb-1">Nama Pemilik Rekening <span className="text-surface-300">(opsional)</span></label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Nama sesuai rekening bank"
                        value={form.bank_account_name}
                        onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Availability</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "available", label: "Available", color: "text-accent-600" },
                      { value: "busy", label: "Busy", color: "text-amber-600" },
                      { value: "unavailable", label: "Unavailable", color: "text-red-500" },
                    ].map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setForm({ ...form, availability: a.value })}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          form.availability === a.value
                            ? "bg-surface-100 border border-surface-300"
                            : "bg-white border border-surface-200 hover:border-surface-300"
                        }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${a.color.replace("text-", "bg-")}`} /> {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {uploadWarning && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  {uploadWarning}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                  <span className="inline-flex items-center justify-center gap-2"><Icon name="arrowLeft" size={16} />Kembali</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {loading ? "Menyimpan..." : <span className="inline-flex items-center justify-center gap-2"><Icon name="ai" size={16} />Simpan & Analisis AI</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}