import OpenAI from "openai";

// Supports OpenAI, DeepSeek, or any OpenAI-compatible API.
// Set AI_API_KEY + optional AI_BASE_URL and AI_MODEL in your .env
const aiApiKey = process.env.AI_API_KEY;
const aiBaseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const aiModel = process.env.AI_MODEL || "deepseek-chat";

const ai = aiApiKey
  ? new OpenAI({ apiKey: aiApiKey, baseURL: aiBaseUrl })
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
  // PRD v5.3 §6.7 — structured experience entries
  experiences?: {
    title: string;
    company?: string | null;
    description?: string | null;
    tech_stack?: string[];
    period?: string;
  }[];
}

export interface JobForMatching {
  title: string;
  description: string;
  required_skills: string[];
  category: string;
  budget_range: string;
  // PRD v5.3 §6.4 — beginner | intermediate | expert (null = not specified)
  experience_level?: string | null;
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
  talents: TalentForMatching[],
  retryCount = 0
): Promise<MatchResult[]> {
  if (!ai) {
    console.warn("[AI] No AI_API_KEY - using mock job matching");
    return generateMockMatches(talents);
  }

  try {
    const systemPrompt = `Kamu adalah mesin matching profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi kesesuaian setiap talenta terhadap job yang diberikan.
Jika tersedia, gunakan cv_text, portfolio_context, dan experiences (daftar pengalaman kerja/project terstruktur: judul, perusahaan, deskripsi, tech_stack, periode) sebagai bukti konkret — experiences adalah bukti terkuat, lebih kuat dari self-report skill.
Jika job memiliki experience_level (beginner/intermediate/expert), bandingkan dengan level skill talenta (PRD v5.3 §6.4):
- Level talenta jauh DI BAWAH requirement → beri penalti skor dan catat di gaps.
- Level sesuai atau sedikit di atas requirement → nilai plus, catat di strengths.
- Level jauh DI ATAS job entry-level → catat sebagai risiko overqualified di reasoning, tanpa penalti besar.

RESPON HANYA JSON dengan struktur:
{
  "matches": [
    {
      "talent_id": "id-talenta",
      "match_score": 85,
      "strengths": ["kelebihan 1", "kelebihan 2"],
      "gaps": ["kekurangan 1"],
      "reasoning": "Penjelasan mengapa talenta ini cocok",
      "portfolio_evidence": "Bukti dari portfolio jika ada",
      "recommendation": "highly_recommended"
    }
  ]
}

recommendation: highly_recommended, recommended, atau not_recommended. Jangan tambahkan teks di luar JSON.`;

    const response = await ai.chat.completions.create({
      model: aiModel,
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
    let rawMatches = Array.isArray(parsed) ? parsed : parsed.matches || parsed.results || [];
    
    const matches = rawMatches.map((match: any) => {
      let score = Number(match.match_score);
      if (isNaN(score) || score < 0 || score > 100) {
        console.warn(`[AI] Invalid match_score ${match.match_score}, defaulting to 50.`);
        score = 50;
      }
      
      let rec = match.recommendation;
      if (!["highly_recommended", "recommended", "not_recommended"].includes(rec)) {
        console.warn(`[AI] Invalid recommendation ${match.recommendation}, defaulting to 'recommended'.`);
        rec = "recommended";
      }
      
      return {
        ...match,
        match_score: score,
        recommendation: rec,
      };
    });
    
    return matches as MatchResult[];
  } catch (error) {
    if (retryCount < 1) {
      console.warn("[AI] Job matching failed, retrying in 5s...", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return generateJobMatches(job, talents, retryCount + 1);
    }
    console.error("[AI] Job matching failed twice, using mock:", error);
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
  },
  retryCount = 0
): Promise<SkillGapResult> {
  if (!ai) {
    console.warn("[AI] No AI_API_KEY - using mock skill gap analysis");
    return generateMockSkillGap(category);
  }

  try {
    const systemPrompt = `Kamu adalah career advisor AI untuk platform freelance Indonesia.
Analisis kesenjangan skill talenta berdasarkan demand pasar yang tersedia.
Jika cv_text tersedia, gunakan sebagai bukti pengalaman kerja nyata. Jika portfolio_context tersedia, jadikan sebagai validasi skill yang diklaim.
Prioritaskan bukti konkret di atas self-report. Berikan maksimal 3 rekomendasi.

RESPON HANYA JSON dengan struktur persis seperti ini:
{
  "recommendations": [
    {
      "skill_name": "Nama Skill",
      "priority": "high",
      "reason": "Alasan kenapa skill ini penting",
      "estimated_impact": "Dampak jika skill ini dikuasai (contoh: Potensi rate naik 30%)",
      "evidence_basis": "form"
    }
  ],
  "summary": "Ringkasan analisis 1-2 kalimat",
  "profile_completeness_score": 75
}

priority hanya: high, medium, atau low. Jangan tambahkan teks di luar JSON.`;

    const response = await ai.chat.completions.create({
      model: aiModel,
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
    if (retryCount < 1) {
      console.warn("[AI] Skill gap analysis failed, retrying in 5s...", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return generateSkillGapAnalysis(talentSkills, category, marketDemand, context, retryCount + 1);
    }
    console.error("[AI] Skill gap analysis failed twice, using mock:", error);
    return generateMockSkillGap(category);
  }
}

function generateMockMatches(talents: TalentForMatching[]): MatchResult[] {
  return talents.map((talent, index) => {
    return {
      talent_id: talent.id,
      match_score: 60,
      strengths: talent.skills.slice(0, 2).map((skill) => `${skill.name} (${skill.level})`),
      gaps: [],
      reasoning: "Kecocokan diproses berdasarkan kategori umum.",
      portfolio_evidence: talent.portfolio_context
        ? talent.portfolio_context.slice(0, 220)
        : undefined,
      recommendation: "recommended",
    };
  });
}

function generateMockSkillGap(category: string): SkillGapResult {
  const isWebDev = category === "web_dev";
  return {
    recommendations: isWebDev
      ? [
          {
            skill_name: "TypeScript",
            priority: "high" as const,
            reason: "Banyak job aktif mensyaratkan TypeScript. Tingkatkan level dari intermediate ke expert.",
            estimated_impact: "Potensi rate naik 30-40% dan akses proyek enterprise",
            evidence_basis: "cv" as const,
          },
          {
            skill_name: "Testing (Jest/Vitest)",
            priority: "medium" as const,
            reason: "Employer mencari developer yang bisa menulis test. Menunjukkan profesionalisme.",
            estimated_impact: "Peluang diterima naik 25%",
            evidence_basis: "form" as const,
          },
        ]
      : [
          {
            skill_name: "Motion Design / After Effects",
            priority: "high" as const,
            reason: "Permintaan konten video animasi meningkat. Skill ini membedakan kamu dari desainer lain.",
            estimated_impact: "Rate project bisa naik 50% dengan skill motion",
            evidence_basis: "form" as const,
          },
          {
            skill_name: "3D Design (Blender)",
            priority: "medium" as const,
            reason: "Brand semakin banyak meminta aset 3D untuk marketing. Masih sedikit desainer yang kuasai.",
            estimated_impact: "Akses niche market dengan budget lebih tinggi",
            evidence_basis: "portfolio" as const,
          },
        ],
    summary: isWebDev
      ? "Skill kamu sudah solid untuk web development. Fokus utama: TypeScript dan testing untuk membuka peluang lebih besar."
      : "Portfolio desainmu bagus. Upgrade ke motion dan 3D untuk naik ke tier selanjutnya.",
    profile_completeness_score: isWebDev ? 65 : 55,
  };
}

function inferOverallLevel(skills: { level: string }[]) {
  if (skills.some((skill) => skill.level === "expert")) return "expert";
  if (skills.some((skill) => skill.level === "intermediate")) return "intermediate";
  return "beginner";
}
