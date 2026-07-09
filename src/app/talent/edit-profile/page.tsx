"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [bio, setBio] = useState("");
  const [ratePerHour, setRatePerHour] = useState("");
  const [ratePerProject, setRatePerProject] = useState("");
  const [availability, setAvailability] = useState("available");
  const [location, setLocation] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [skills, setSkills] = useState<{ id: string; name: string; level: string }[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // PRD v5.3 §6.7 — structured experience/projects
  interface ExperienceForm {
    title: string;
    company: string;
    description: string;
    tech_stack: string; // comma-separated in the form, split on submit
    start_date: string;
    end_date: string;
    url: string;
  }
  const [experiences, setExperiences] = useState<ExperienceForm[]>([]);

  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/talent/profile").then(res => res.json()),
      fetch("/api/skills").then(res => res.json())
    ]).then(([profileRes, skillsRes]) => {
      if (profileRes.success) {
        const p = profileRes.data;
        setProfile(p);
        setBio(p.bio || "");
        setRatePerHour(p.rate_per_hour?.toString() || "");
        setRatePerProject(p.rate_per_project?.toString() || "");
        setAvailability(p.availability || "available");
        setLocation(p.location || "");
        setPortfolioUrl(p.portfolio_url || "");
        setSlug(p.slug || "");
        setSkills(p.skills || []);
        setExperiences(
          (p.experiences || []).map((ex: {
            title: string; company: string | null; description: string | null;
            tech_stack: string[]; start_date: string | null; end_date: string | null; url: string | null;
          }) => ({
            title: ex.title || "",
            company: ex.company || "",
            description: ex.description || "",
            tech_stack: (ex.tech_stack || []).join(", "),
            start_date: ex.start_date ? ex.start_date.slice(0, 10) : "",
            end_date: ex.end_date ? ex.end_date.slice(0, 10) : "",
            url: ex.url || "",
          }))
        );
      }
      if (skillsRes.success) {
        setAvailableSkills(skillsRes.data);
      }
      setLoading(false);
    });
  }, []);

  const handleAddSkill = () => {
    if (!newSkill) return;
    const skillObj = availableSkills.find(s => s.id === newSkill);
    if (!skillObj) return;

    if (!skills.find(s => s.id === newSkill)) {
      setSkills([...skills, { id: skillObj.id, name: skillObj.name, level: "intermediate" }]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleUpdateLevel = (id: string, level: string) => {
    setSkills(skills.map(s => s.id === id ? { ...s, level } : s));
  };

  // PRD v5.3 §6.7 — experience list helpers
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { title: "", company: "", description: "", tech_stack: "", start_date: "", end_date: "", url: "" },
    ]);
  };
  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: keyof ExperienceForm, value: string) => {
    setExperiences(experiences.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/talent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          rate_per_hour: Number(ratePerHour) || undefined,
          rate_per_project: Number(ratePerProject) || undefined,
          availability,
          location,
          portfolio_url: portfolioUrl,
          slug: slug || undefined,
          skills,
          // PRD v5.3 §6.7 — drop empty rows, split tech stack
          experiences: experiences
            .filter((ex) => ex.title.trim().length >= 2)
            .map((ex) => ({
              title: ex.title.trim(),
              company: ex.company.trim() || null,
              description: ex.description.trim() || null,
              tech_stack: ex.tech_stack
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              start_date: ex.start_date || null,
              end_date: ex.end_date || null,
              url: ex.url.trim() || null,
            })),
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push("/talent/dashboard");
      } else {
        alert(data.message || "Gagal mengupdate profil");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/talent/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors text-surface-500">
            <Icon name="arrowLeft" size={20} />
          </Link>
          <h1 className="font-bold text-surface-900" >Edit Profil</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4 text-surface-900" >Informasi Dasar</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Bio Singkat</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  rows={4}
                  placeholder="Ceritakan tentang diri Anda dan pengalaman Anda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Tarif per Jam (Rp)</label>
                  <input
                    type="number"
                    value={ratePerHour}
                    onChange={(e) => setRatePerHour(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Tarif per Project (Rp)</label>
                  <input
                    type="number"
                    value={ratePerProject}
                    onChange={(e) => setRatePerProject(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="1500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Ketersediaan</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="available">Tersedia (Full-time)</option>
                    <option value="part_time">Tersedia (Part-time / Weekend)</option>
                    <option value="busy">Sedang Sibuk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder={profile?.category === "graphic_designer" ? "https://behance.net/..." : "https://github.com/..."}
                />
                <p className="mt-1 text-[10px] text-surface-400">
                  {profile?.category === "graphic_designer"
                    ? "Behance, Dribbble, Figma, atau portofolio desain lainnya."
                    : "GitHub, GitLab, website pribadi, atau portofolio kode."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Profile URL Kustom</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-surface-100 border border-r-0 border-surface-200 rounded-l-lg text-xs text-surface-500">
                    nyamby.id/talents/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                    className="w-full px-3 py-2 bg-white border border-surface-200 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    placeholder="nama-kamu"
                  />
                </div>
                <p className="mt-1 text-[10px] text-surface-400">
                  Biarkan kosong untuk URL default.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-surface-900" >
              Keahlian & Skill
              <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
                <Icon name="ai" size={10} /> AI Skill Gap Analysis
              </span>
            </h2>
            <p className="text-sm text-surface-500 mb-6">
              Tambahkan atau ubah keahlian Anda. Setiap kali skill diupdate, <b>AI Career Companion</b> akan otomatis memperbarui Insight Skill Gap Anda.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Pilih Skill Baru...</option>
                {availableSkills.map(s => (
                  <option key={s.id} value={s.id} disabled={skills.some(existing => existing.id === s.id)}>{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-secondary px-4 py-2 shrink-0"
              >
                Tambah
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-200 bg-surface-50">
                  <div className="font-medium text-surface-900">{skill.name}</div>
                  <div className="flex items-center gap-3">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateLevel(skill.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-white border border-surface-200 rounded outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRD v5.3 §6.7 — Structured Experience / Projects */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-surface-900">
              Pengalaman & Project
              <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-medium tracking-wide flex items-center gap-1">
                <Icon name="ai" size={10} /> Meningkatkan Akurasi AI Matching
              </span>
            </h2>
            <p className="text-sm text-surface-500 mb-6">
              Data terstruktur ini dipakai AI sebagai bukti terkuat saat mencocokkan Anda dengan job — lebih kuat dari bio atau CV bebas teks.
            </p>

            <div className="space-y-4">
              {experiences.map((ex, i) => (
                <div key={i} className="p-4 rounded-xl border border-surface-200 bg-surface-50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="text"
                      value={ex.title}
                      onChange={(e) => updateExperience(i, "title", e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm font-medium"
                      placeholder="Judul pengalaman / project (mis. Redesign landing page e-commerce)"
                    />
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                      aria-label="Hapus pengalaman"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={ex.company}
                      onChange={(e) => updateExperience(i, "company", e.target.value)}
                      className="px-3 py-2 bg-white border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                      placeholder="Perusahaan / client (opsional)"
                    />
                    <input
                      type="text"
                      value={ex.tech_stack}
                      onChange={(e) => updateExperience(i, "tech_stack", e.target.value)}
                      className="px-3 py-2 bg-white border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                      placeholder="Tech/tools, pisahkan koma (React, Figma)"
                    />
                  </div>
                  <textarea
                    value={ex.description}
                    onChange={(e) => updateExperience(i, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
                    placeholder="Peran & hasil yang dicapai (opsional tapi sangat membantu AI)"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-surface-400 mb-1">Mulai</label>
                      <input
                        type="date"
                        value={ex.start_date}
                        onChange={(e) => updateExperience(i, "start_date", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-surface-400 mb-1">Selesai (kosong = masih berjalan)</label>
                      <input
                        type="date"
                        value={ex.end_date}
                        onChange={(e) => updateExperience(i, "end_date", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] text-surface-400 mb-1">Link (opsional)</label>
                      <input
                        type="url"
                        value={ex.url}
                        onChange={(e) => updateExperience(i, "url", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg outline-none text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                disabled={experiences.length >= 20}
                className="w-full py-3 rounded-xl border-2 border-dashed border-surface-300 text-surface-500 text-sm font-medium hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-50"
              >
                + Tambah Pengalaman / Project
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <Link href="/talent/dashboard" className="px-6 py-2.5 rounded-full text-surface-600 font-medium hover:bg-surface-100 transition-colors">
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-2.5 shadow-md shadow-primary-500/20 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Menyimpan & Memproses AI...
                </>
              ) : (
                "Simpan Profil"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
