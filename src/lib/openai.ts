import OpenAI from "openai";

// Supports OpenAI, DeepSeek, or any OpenAI-compatible API.
// Set AI_API_KEY + optional AI_BASE_URL and AI_MODEL in your .env
const aiApiKey = process.env.AI_API_KEY;
const aiBaseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const aiModel = process.env.AI_MODEL || "gpt-4o";

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
Jika tersedia, gunakan cv_text dan portfolio_context sebagai bukti konkret, bukan hanya self-report skill.
Selalu respons dalam format JSON object dengan key "matches" berisi array. Jangan tambahkan teks di luar JSON.`;

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
    const matches = Array.isArray(parsed) ? parsed : parsed.matches || parsed.results || [];
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
Respons dalam format JSON dengan recommendations, summary, dan profile_completeness_score. Jangan tambahkan teks di luar JSON.`;

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
  return {
    recommendations: [],
    summary: "Sistem AI sedang sibuk, kumpulkan bukti portfolio Anda secara manual.",
    profile_completeness_score: 50,
  };
}

function inferOverallLevel(skills: { level: string }[]) {
  if (skills.some((skill) => skill.level === "expert")) return "expert";
  if (skills.some((skill) => skill.level === "intermediate")) return "intermediate";
  return "beginner";
}
