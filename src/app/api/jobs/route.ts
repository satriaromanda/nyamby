import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateJobMatches } from "@/lib/openai";

// POST: Client creates a new job + triggers AI matching
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa post job" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, budget_min, budget_max, deadline, required_skills } = body;

    if (!title || !description || !category || !required_skills || required_skills.length === 0) {
      return NextResponse.json(
        { success: false, message: "Judul, deskripsi, kategori, dan minimal 1 skill wajib diisi" },
        { status: 400 }
      );
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        clientUserId: session.userId,
        title,
        description,
        category,
        budgetMin: budget_min || null,
        budgetMax: budget_max || null,
        deadline: deadline ? new Date(deadline) : null,
        status: "active",
      },
    });

    // Link required skills
    for (const sk of required_skills) {
      await prisma.jobRequiredSkill.create({
        data: {
          jobId: job.id,
          skillId: sk.skill_id,
          isMandatory: sk.is_mandatory !== false,
        },
      });
    }

    // Trigger AI Job Matching
    const jobWithSkills = await prisma.job.findUnique({
      where: { id: job.id },
      include: { requiredSkills: { include: { skill: true } } },
    });

    const allTalents = await prisma.talentProfile.findMany({
      where: { category },
      include: {
        user: { select: { fullName: true } },
        talentSkills: { include: { skill: true } },
      },
    });

    if (allTalents.length > 0 && jobWithSkills) {
      const jobData = {
        title: jobWithSkills.title,
        description: jobWithSkills.description,
        required_skills: jobWithSkills.requiredSkills.map((rs) => rs.skill.name),
        category: jobWithSkills.category,
        budget_range: `${jobWithSkills.budgetMin || 0} - ${jobWithSkills.budgetMax || "Negotiable"} IDR`,
      };

      const talentData = allTalents.map((t) => ({
        id: t.id,
        name: t.user.fullName,
        skills: t.talentSkills.map((ts) => ({ name: ts.skill.name, level: ts.level })),
        category: t.category,
        rate: Number(t.ratePerHour || 0),
        bio: t.bio || "",
      }));

      const matches = await generateJobMatches(jobData, talentData);

      // Save matches to DB
      for (const match of matches) {
        await prisma.jobMatch.upsert({
          where: {
            jobId_talentProfileId: {
              jobId: job.id,
              talentProfileId: match.talent_id,
            },
          },
          update: {
            matchScore: match.match_score,
            strengths: match.strengths,
            gaps: match.gaps,
            reasoning: match.reasoning,
            recommendation: match.recommendation,
          },
          create: {
            jobId: job.id,
            talentProfileId: match.talent_id,
            matchScore: match.match_score,
            strengths: match.strengths,
            gaps: match.gaps,
            reasoning: match.reasoning,
            recommendation: match.recommendation,
          },
        });

        // Send notification to matched talent
        const talentProfile = allTalents.find((t) => t.id === match.talent_id);
        if (talentProfile) {
          await prisma.notification.create({
            data: {
              userId: talentProfile.userId,
              type: "new_match",
              message: `Ada job baru yang cocok untukmu: ${job.title} (${match.match_score}% match)`,
              relatedJobId: job.id,
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job berhasil diposting. AI sedang mencarikan talenta terbaik.",
        data: { job_id: job.id, status: "active", matching_triggered: allTalents.length > 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[PostJob]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: List all active jobs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skill = searchParams.get("skill");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = { status: "active" };
    if (category) where.category = category;
    if (skill) {
      where.requiredSkills = {
        some: { skill: { name: { contains: skill, mode: "insensitive" } } },
      };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: { select: { fullName: true } },
          requiredSkills: { include: { skill: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description,
          category: j.category,
          client_name: j.client.fullName,
          budget_min: j.budgetMin,
          budget_max: j.budgetMax,
          deadline: j.deadline,
          status: j.status,
          created_at: j.createdAt,
          required_skills: j.requiredSkills.map((rs) => ({
            name: rs.skill.name,
            is_mandatory: rs.isMandatory,
          })),
        })),
        pagination: { page, limit, total },
      },
    });
  } catch (error) {
    console.error("[ListJobs]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
