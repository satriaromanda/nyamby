"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiMatching, setAiMatching] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "web_dev",
    budget_min: "",
    budget_max: "",
    deadline: "",
    required_skills: [] as { skill_id: string; is_mandatory: boolean; name: string }[],
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

  if (aiMatching) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-accent flex items-center justify-center text-4xl text-white animate-pulse-glow">
            <Icon name="ai" size={40} /></div>
          <h2 className="text-2xl font-bold mb-3 text-surface-900" style={{ fontFamily: "Outfit" }}>
            AI sedang mencarikan talenta terbaik...
          </h2>
          <p className="text-surface-500 text-sm mb-6">
            Mengevaluasi seluruh talent pool dan menghitung match score
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
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm text-white" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>Nyamby</span>
          </Link>
          <Link href="/client/dashboard" className="text-sm text-surface-500 hover:text-surface-900">
            <span className="inline-flex items-center gap-1"><Icon name="arrowLeft" size={14} />Kembali ke Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
          Post Job Baru
        </h1>
        <p className="text-surface-500 mb-8">
          Deskripsikan kebutuhanmu dan AI akan mencarikan talenta terbaik.
        </p>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-surface-600 mb-2">Judul Job *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Contoh: Landing Page untuk UMKM Kuliner"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">Deskripsi Lengkap *</label>
            <textarea
              className="input-dark min-h-[120px] resize-none"
              placeholder="Jelaskan kebutuhan project secara detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-surface-600 mb-2">Kategori *</label>
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

          <div>
            <label className="block text-sm text-surface-600 mb-2">
              Required Skills * ({form.required_skills.length} dipilih)
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-2">Budget Min (IDR)</label>
              <input
                type="number"
                className="input-dark"
                placeholder="1000000"
                value={form.budget_min}
                onChange={(e) => setForm({ ...form, budget_min: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-2">Budget Max (IDR)</label>
              <input
                type="number"
                className="input-dark"
                placeholder="3000000"
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
            className="btn-primary w-full py-3.5 text-base disabled:opacity-30"
          >
            {loading ? "Posting..." : <span className="inline-flex items-center justify-center gap-2"><Icon name="ai" size={16} />Post Job & Trigger AI Matching</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
