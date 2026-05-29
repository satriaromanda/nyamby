import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TalentForMatching {
  id: string;
  name: string;
  skills: { name: string; level: string }[];
  category: string;
  rate: number;
  bio: string;
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
  recommendation: "highly_recommended" | "recommended" | "not_recommended";
}

export interface SkillGapResult {
  recommendations: {
    skill_name: string;
    priority: "high" | "medium" | "low";
    reason: string;
    estimated_impact: string;
  }[];
  summary: string;
}

// ─── AI Job Matching ────────────────────────────────────────────────────────

export async function generateJobMatches(
  job: JobForMatching,
  talents: TalentForMatching[]
): Promise<MatchResult[]> {
  if (!openai) {
    console.warn("[AI] No OPENAI_API_KEY — using mock job matching");
    return generateMockMatches(talents);
  }

  try {
    const systemPrompt = `Kamu adalah mesin matching profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi kesesuaian setiap talenta terhadap job yang diberikan.
Selalu respons dalam format JSON array. Jangan tambahkan teks di luar JSON.`;

    const userPrompt = JSON.stringify({ job, talents });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    // Handle both { matches: [...] } and direct array formats
    const matches = Array.isArray(parsed) ? parsed : parsed.matches || parsed.results || [];
    return matches as MatchResult[];
  } catch (error) {
    console.error("[AI] Job matching failed, using mock:", error);
    return generateMockMatches(talents);
  }
}

// ─── AI Skill Gap Analysis ──────────────────────────────────────────────────

export async function generateSkillGapAnalysis(
  talentSkills: { name: string; level: string }[],
  category: string,
  marketDemand: { skill_name: string; frequency_in_jobs: number; avg_budget: number }[]
): Promise<SkillGapResult> {
  if (!openai) {
    console.warn("[AI] No OPENAI_API_KEY — using mock skill gap analysis");
    return generateMockSkillGap(category);
  }

  try {
    const systemPrompt = `Kamu adalah career advisor AI untuk platform freelance Indonesia.
Analisis kesenjangan skill talenta berdasarkan demand pasar yang tersedia.
Berikan maksimal 3 rekomendasi. Respons dalam format JSON. Jangan tambahkan teks di luar JSON.`;

    const userPrompt = JSON.stringify({
      talent: { skills: talentSkills, category },
      market_demand: marketDemand,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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

// ─── Mock Fallbacks ─────────────────────────────────────────────────────────

function generateMockMatches(talents: TalentForMatching[]): MatchResult[] {
  return talents.map((t, i) => {
    const score = Math.max(95 - i * 12, 40) + Math.random() * 5;
    return {
      talent_id: t.id,
      match_score: Math.round(score * 100) / 100,
      strengths: t.skills.slice(0, 2).map((s) => `${s.name} (${s.level})`),
      gaps: ["Belum ada pengalaman TypeScript"],
      reasoning: `Talenta ${t.name} memiliki ${t.skills.length} skill yang relevan. Rate kompetitif di ${t.rate?.toLocaleString("id-ID")} IDR. ${t.bio || ""}`,
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
      reason: "Muncul di 23 dari 30 job aktif di kategorimu. Employer semakin menuntut type safety.",
      estimated_impact: "Potensi rate naik 30–40%",
    },
    {
      skill_name: "Jest / Testing",
      priority: "medium" as const,
      reason: "12 job membutuhkan pengalaman testing. Unit test menunjukkan profesionalisme tinggi.",
      estimated_impact: "Peluang diterima naik 25%",
    },
    {
      skill_name: "Docker & CI/CD",
      priority: "low" as const,
      reason: "5 job enterprise membutuhkan deployment knowledge. Menambah nilai di proyek skala besar.",
      estimated_impact: "Akses ke proyek enterprise dengan budget 2x lipat",
    },
  ];

  const designRecs = [
    {
      skill_name: "Figma Prototyping",
      priority: "high" as const,
      reason: "18 dari 25 job desain membutuhkan interactive prototype, bukan hanya static mockup.",
      estimated_impact: "Potensi rate naik 35%",
    },
    {
      skill_name: "Motion Graphics",
      priority: "medium" as const,
      reason: "Demand untuk micro-animation dan Lottie semakin tinggi di UI/UX projects.",
      estimated_impact: "Peluang diterima naik 30%",
    },
    {
      skill_name: "Design System",
      priority: "low" as const,
      reason: "Kemampuan membangun design system menunjukkan pemikiran sistematis yang dicari client enterprise.",
      estimated_impact: "Akses ke proyek jangka panjang",
    },
  ];

  const recs = category === "web_dev" ? webDevRecs : designRecs;
  return {
    recommendations: recs,
    summary:
      category === "web_dev"
        ? "Skill kamu sudah solid untuk entry level web development. Pasar saat ini sangat menuntut TypeScript dan testing knowledge. Menambah kedua skill ini akan meningkatkan match rate kamu secara signifikan."
        : "Skill desain dasarmu sudah baik. Pasar saat ini bergerak ke arah interactive prototype dan motion. Upgrade ke Figma prototyping akan membuka banyak peluang baru.",
  };
}
