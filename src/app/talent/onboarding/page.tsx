"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Code, Palette, Check, ChevronRight, ChevronLeft, Sparkles, Circle } from "lucide-react";

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

  const [form, setForm] = useState({
    bio: "",
    category: "" as string,
    rate_per_hour: "",
    rate_per_project: "",
    availability: "available",
    location: "",
    portfolio_url: "",
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
    setLoading(true);
    setError("");

    try {
      setAiLoading(true);
      const res = await fetch("/api/talent/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rate_per_hour: form.rate_per_hour ? Number(form.rate_per_hour) : null,
          rate_per_project: form.rate_per_project ? Number(form.rate_per_project) : null,
          skills: form.skills.map((s) => ({ skill_id: s.skill_id, level: s.level })),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        setAiLoading(false);
        return;
      }

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
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center text-white animate-pulse-glow">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-surface-900" style={{ fontFamily: "Outfit" }}>
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
    <div className="min-h-screen gradient-hero">
      <div className="max-w-2xl mx-auto px-6 py-12">
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
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? "bg-primary-500" : "bg-surface-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 animate-slide-up">
          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Pilih Kategorimu
              </h2>
              <p className="text-surface-500 text-sm mb-8">
                Kategori apa yang paling menggambarkan keahlianmu?
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "web_dev", label: "Web Developer", Icon: Code, desc: "Frontend, Backend, Full-stack" },
                  { value: "graphic_designer", label: "Graphic Designer", Icon: Palette, desc: "UI/UX, Branding, Visual" },
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
                    <cat.Icon className={`w-8 h-8 mb-3 ${form.category === cat.value ? "text-white" : "text-primary-500"}`} />
                    <div className={`font-bold mb-1 ${form.category === cat.value ? "text-white" : "text-surface-900"}`}>{cat.label}</div>
                    <div className="text-xs opacity-70">{cat.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => form.category && setStep(2)}
                disabled={!form.category}
                className="btn-primary w-full py-3 disabled:opacity-30 flex items-center justify-center gap-1"
              >
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
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
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${
                            selected ? "bg-primary-500 text-white" : "border border-surface-300"
                          }`}>
                            {selected && <Check className="w-3 h-3" />}
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
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 flex items-center justify-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  onClick={() => form.skills.length > 0 && setStep(3)}
                  disabled={form.skills.length === 0}
                  className="btn-primary flex-1 py-3 disabled:opacity-30 flex items-center justify-center gap-1"
                >
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-surface-600 mb-2">Rate / Jam (IDR)</label>
                    <input
                      type="number"
                      className="input-dark"
                      placeholder="75000"
                      value={form.rate_per_hour}
                      onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })}
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
                  />
                </div>

                <div>
                  <label className="block text-sm text-surface-600 mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    className="input-dark"
                    placeholder="https://github.com/username"
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  />
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
                        <Circle className={`w-2 h-2 inline mr-1 fill-current ${a.color}`} /> {a.label}
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

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3 flex items-center justify-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Menyimpan..." : "Simpan & Analisis AI"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
