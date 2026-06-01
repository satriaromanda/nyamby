import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface TalentForMatching {
  id: string;
  name: string;
  skills: { name: string; level: string }[];
  category: string;
  rate: number;
  bio: string;
  cv_text?: string | null;
  portfolio_context?: string | null;
}

export interface JobForMatching {
  title: string;
  description: string;
  required_skills: string[];
  category: string;
  budget_range: string;
}

export interface MatchResult {
  talent_id: string;
  match_score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  portfolio_evidence?: string;
  recommendation: "highly_recommended" | "recommended" | "not_recommended";
}

export interface SkillGapResult {
  recommendations: {
    skill_name: string;
    priority: "high" | "medium" | "low";
    reason: string;
    estimated_impact: string;
    evidence_basis?: "form" | "cv" | "portfolio";
  }[];
  summary: string;
  profile_completeness_score?: number;
}

export async function generateJobMatches(
  job: JobForMatching,
  talents: TalentForMatching[]
): Promise<MatchResult[]> {
  if (!openai) {
    console.warn("[AI] No OPENAI_API_KEY - using mock job matching");
    return generateMockMatches(talents);
  }

  try {
    const systemPrompt = `Kamu adalah mesin matching profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi kesesuaian setiap talenta terhadap job yang diberikan.
Jika tersedia, gunakan cv_text dan portfolio_context sebagai bukti konkret, bukan hanya self-report skill.
Selalu respons dalam format JSON object dengan key "matches" berisi array. Jangan tambahkan teks di luar JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ job, talents }) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    const matches = Array.isArray(parsed) ? parsed : parsed.matches || parsed.results || [];
    return matches as MatchResult[];
  } catch (error) {
    console.error("[AI] Job matching failed, using mock:", error);
    return generateMockMatches(talents);
  }
}

export async function generateSkillGapAnalysis(
  talentSkills: { name: string; level: string }[],
  category: string,
  marketDemand: { skill_name: string; frequency_in_jobs: number; avg_budget: number }[],
  context?: {
    level?: string;
    bio?: string | null;
    cv_text?: string | null;
    portfolio_context?: string | null;
  }
): Promise<SkillGapResult> {
  if (!openai) {
    console.warn("[AI] No OPENAI_API_KEY - using mock skill gap analysis");
    return generateMockSkillGap(category);
  }

  try {
    const systemPrompt = `Kamu adalah career advisor AI untuk platform freelance Indonesia.
Analisis kesenjangan skill talenta berdasarkan demand pasar yang tersedia.
Jika cv_text tersedia, gunakan sebagai bukti pengalaman kerja nyata. Jika portfolio_context tersedia, jadikan sebagai validasi skill yang diklaim.
Prioritaskan bukti konkret di atas self-report. Berikan maksimal 3 rekomendasi.
Respons dalam format JSON dengan recommendations, summary, dan profile_completeness_score. Jangan tambahkan teks di luar JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            talent: {
              skills: talentSkills,
              category,
              level: context?.level || inferOverallLevel(talentSkills),
              bio: context?.bio || "",
              cv_text: context?.cv_text || null,
              portfolio_context: context?.portfolio_context || null,
            },
            market_demand: marketDemand,
          }),
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    return JSON.parse(content) as SkillGapResult;
  } catch (error) {
    console.error("[AI] Skill gap analysis failed, using mock:", error);
    return generateMockSkillGap(category);
  }
}

function generateMockMatches(talents: TalentForMatching[]): MatchResult[] {
  return talents.map((talent, index) => {
    const enrichmentBonus = (talent.cv_text ? 3 : 0) + (talent.portfolio_context ? 4 : 0);
    const score = Math.min(Math.max(95 - index * 12, 40) + Math.random() * 5 + enrichmentBonus, 99);

    return {
      talent_id: talent.id,
      match_score: Math.round(score * 100) / 100,
      strengths: talent.skills.slice(0, 2).map((skill) => `${skill.name} (${skill.level})`),
      gaps: ["Belum ada pengalaman TypeScript"],
      reasoning: `Talenta ${talent.name} memiliki ${talent.skills.length} skill yang relevan. Rate kompetitif di ${talent.rate?.toLocaleString("id-ID")} IDR. ${talent.portfolio_context ? "Portofolio memberi bukti tambahan untuk skill yang diklaim. " : ""}${talent.bio || ""}`,
      portfolio_evidence: talent.portfolio_context
        ? talent.portfolio_context.slice(0, 220)
        : undefined,
      recommendation:
        score > 80
          ? "highly_recommended"
          : score > 60
            ? "recommended"
            : "not_recommended",
    };
  });
}

function generateMockSkillGap(category: string): SkillGapResult {
  const webDevRecs = [
    {
      skill_name: "TypeScript",
      priority: "high" as const,
      reason: "Banyak job web aktif meminta type safety dan maintainability. Bukti portofolio akan membuat klaim React/Next.js lebih kuat.",
      estimated_impact: "Potensi rate naik 30-40%",
      evidence_basis: "portfolio" as const,
    },
    {
      skill_name: "Jest / Testing",
      priority: "medium" as const,
      reason: "Client yang membayar lebih tinggi mencari talenta yang bisa membuktikan kualitas lewat testing.",
      estimated_impact: "Peluang diterima naik 25%",
      evidence_basis: "form" as const,
    },
    {
      skill_name: "Docker & CI/CD",
      priority: "low" as const,
      reason: "CV dan pengalaman deployment membantu membuka akses ke proyek web yang lebih serius.",
      estimated_impact: "Akses ke proyek enterprise dengan budget 2x lipat",
      evidence_basis: "cv" as const,
    },
  ];

  const designRecs = [
    {
      skill_name: "Figma Prototyping",
      priority: "high" as const,
      reason: "Job desain makin sering meminta prototype interaktif, bukan hanya mockup statis.",
      estimated_impact: "Potensi rate naik 35%",
      evidence_basis: "portfolio" as const,
    },
    {
      skill_name: "Motion Graphics",
      priority: "medium" as const,
      reason: "Demand micro-animation dan konten sosial meningkat untuk proyek UKM.",
      estimated_impact: "Peluang diterima naik 30%",
      evidence_basis: "form" as const,
    },
    {
      skill_name: "Design System",
      priority: "low" as const,
      reason: "Bukti pengalaman sistem desain di CV/portofolio memberi sinyal profesional untuk client besar.",
      estimated_impact: "Akses ke proyek jangka panjang",
      evidence_basis: "cv" as const,
    },
  ];

  return {
    recommendations: category === "web_dev" ? webDevRecs : designRecs,
    summary:
      category === "web_dev"
        ? "Skill web kamu sudah kuat untuk MVP freelance. Tambahkan bukti portfolio dan upgrade TypeScript/testing agar match rate naik."
        : "Skill desain dasarmu sudah baik. Pasar bergerak ke arah prototype, motion, dan bukti portofolio yang rapi.",
    profile_completeness_score: 82,
  };
}

function inferOverallLevel(skills: { level: string }[]) {
  if (skills.some((skill) => skill.level === "expert")) return "expert";
  if (skills.some((skill) => skill.level === "intermediate")) return "intermediate";
  return "beginner";
}
