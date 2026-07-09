"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

interface Skill {
  id: string;
  name: string;
  category: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  IDR: "Rp",
  MYR: "RM",
  SGD: "S$",
  USD: "$",
};

const CURRENCY_PLACEHOLDERS: Record<string, { min: string; max: string }> = {
  IDR: { min: "1000000", max: "3000000" },
  MYR: { min: "300", max: "900" },
  SGD: { min: "150", max: "500" },
  USD: { min: "100", max: "400" },
};

export default function PostJobPage() {
  const router = useRouter();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiMatching, setAiMatching] = useState(false);
  const [error, setError] = useState("");
  const [clientCurrency, setClientCurrency] = useState("IDR");
  const [isExportClient, setIsExportClient] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "web_dev",
    budget_min: "",
    budget_max: "",
    deadline: "",
    // PRD v5.3 §6.4 — required experience level ("" = tidak spesifik)
    experience_level: "",
    required_skills: [] as { skill_id: string; is_mandatory: boolean; name: string }[],
  });

  useEffect(() => {
    // Fetch skills
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAllSkills(d.data);
      });

    // PRD v4.0: Fetch client profile to get preferred currency
    fetch("/api/client/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const currency = d.data.preferred_currency || d.data.preferredCurrency || "IDR";
          setClientCurrency(currency);
          setIsExportClient(currency !== "IDR");
        }
      })
      .catch(() => {});
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
    const exists = form.required_skills.find((s) => s.skill_id === skill.id);
    if (exists) {
      setForm({
        ...form,
        required_skills: form.required_skills.filter((s) => s.skill_id !== skill.id),
      });
    } else {
      setForm({
        ...form,
        required_skills: [
          ...form.required_skills,
          { skill_id: skill.id, is_mandatory: true, name: skill.name },
        ],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      setAiMatching(true);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experience_level: form.experience_level || null,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          required_skills: form.required_skills.map((s) => ({
            skill_id: s.skill_id,
            is_mandatory: s.is_mandatory,
          })),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        setAiMatching(false);
        return;
      }

      // Show AI matching animation
      setTimeout(() => {
        setAiMatching(false);
        router.push("/client/dashboard");
      }, 2500);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setAiMatching(false);
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = CURRENCY_SYMBOLS[clientCurrency] || clientCurrency;
  const placeholders = CURRENCY_PLACEHOLDERS[clientCurrency] || CURRENCY_PLACEHOLDERS.IDR;

  if (aiMatching) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-accent flex items-center justify-center text-4xl text-white animate-pulse-glow">
            <Icon name="ai" size={40} /></div>
          <h2 className="text-2xl font-bold mb-3 text-surface-900" >
            {isExportClient ? "AI is finding the best talent for you..." : "AI sedang mencarikan talenta terbaik..."}
          </h2>
          <p className="text-surface-500 text-sm mb-6">
            {isExportClient ? "Evaluating the entire talent pool and calculating match scores" : "Mengevaluasi seluruh talent pool dan menghitung match score"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50" role="navigation">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <Link href="/client/dashboard" className="text-sm text-surface-500 hover:text-surface-900">
            <span className="inline-flex items-center gap-1">
              <Icon name="arrowLeft" size={14} />
              {isExportClient ? "Back to Dashboard" : "Kembali ke Dashboard"}
            </span>
          </Link>
        </div>
      </nav>

      <main role="main" className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-surface-900" >
          {isExportClient ? "Post a New Job" : "Post Job Baru"}
        </h1>
        <p className="text-surface-500 mb-8">
          {isExportClient
            ? "Describe your needs and AI will find the best Indonesian talent."
            : "Deskripsikan kebutuhanmu dan AI akan mencarikan talenta terbaik."}
        </p>

        {/* PRD v4.0: Currency indicator for export clients */}
        {isExportClient && (
          <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
              {currencySymbol}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                Budgets displayed in {clientCurrency}
              </p>
              <p className="text-xs text-primary-600">
                Amounts are converted to IDR for processing. Exchange rates are locked at posting time.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          <div>
            <label className="block text-sm text-surface-600 mb-2">
              {isExportClient ? "Job Title *" : "Judul Job *"}
            </label>
            <input
              type="text"
              className="input-dark"
              placeholder={isExportClient ? "e.g. Landing Page for F&B Business" : "Contoh: Landing Page untuk UMKM Kuliner"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">
              {isExportClient ? "Full Description *" : "Deskripsi Lengkap *"}
            </label>
            <textarea
              className="input-dark min-h-[120px] resize-none"
              placeholder={isExportClient ? "Describe your project requirements in detail..." : "Jelaskan kebutuhan project secara detail..."}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">
              {isExportClient ? "Category *" : "Kategori *"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "web_dev", label: "Web Development", icon: "code" as const },
                { value: "graphic_designer", label: "Graphic Design", icon: "design" as const },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value, required_skills: [] })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    form.category === cat.value
                      ? "gradient-primary text-white"
                      : "bg-white border border-surface-200 text-surface-600 hover:border-primary-200"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2"><Icon name={cat.icon} size={15} />{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PRD v5.3 §6.4 — experience level */}
          <div>
            <label className="block text-sm text-surface-600 mb-2">
              {isExportClient ? "Experience Level" : "Level Pengalaman"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: "", label: isExportClient ? "Any" : "Bebas" },
                { value: "beginner", label: "Entry" },
                { value: "intermediate", label: "Intermediate" },
                { value: "expert", label: "Expert" },
              ].map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setForm({ ...form, experience_level: lvl.value })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    form.experience_level === lvl.value
                      ? "gradient-primary text-white"
                      : "bg-white border border-surface-200 text-surface-600 hover:border-primary-200"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-surface-400 mt-2">
              {isExportClient
                ? "AI matching will factor talent seniority against this level."
                : "AI matching akan mempertimbangkan senioritas talenta terhadap level ini."}
            </p>
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">
              Required Skills * ({form.required_skills.length} {isExportClient ? "selected" : "dipilih"})
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((skill) => {
                const selected = form.required_skills.find((s) => s.skill_id === skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      selected
                        ? "gradient-primary text-white"
                        : "bg-white border border-surface-200 text-surface-500 hover:border-primary-200"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
            {form.required_skills.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                {isExportClient ? "Select at least 1 skill to post the job." : "Pilih minimal 1 skill untuk bisa post job."}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-2">
                Budget Min ({currencySymbol})
              </label>
              <input
                type="number"
                className="input-dark"
                placeholder={placeholders.min}
                value={form.budget_min}
                onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-2">
                Budget Max ({currencySymbol})
              </label>
              <input
                type="number"
                className="input-dark"
                placeholder={placeholders.max}
                value={form.budget_max}
                onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">Deadline</label>
            <input
              type="date"
              className="input-dark"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.title || !form.description || form.required_skills.length === 0}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-30 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {loading ? "Posting..." : <span className="inline-flex items-center justify-center gap-2"><Icon name="ai" size={16} />Post Job & Trigger AI Matching</span>}
          </button>
        </form>
      </main>
    </div>
  );
}
