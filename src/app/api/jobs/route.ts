import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jobCreateSchema } from "@/lib/validations";
import { getPaginationParams, buildPaginationMeta } from "@/lib/paginate";

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
    
    // 1. Zod Validation
    const result = jobCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const { title, description, category, budget_min, budget_max, deadline, required_skills } = result.data;

    // 2. Create job
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

    // 3. Bulk insert required skills
    await prisma.jobRequiredSkill.createMany({
      data: required_skills.map((sk) => ({
        jobId: job.id,
        skillId: sk.skill_id,
        isMandatory: sk.is_mandatory !== false,
      })),
    });

    // 4. Trigger AI Job Matching in Background
    const { runAiJobMatching } = await import("@/services/ai-matching");
    runAiJobMatching(job.id, category).catch((err) => {
      console.error("Failed to run background AI matching", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job berhasil diposting. AI sedang mencarikan talenta terbaik.",
        data: { job_id: job.id, status: "active", ai_matching_status: "processing" },
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

// GET: List all jobs with full PRD §1.3 filter support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, per_page, skip, take } = getPaginationParams(searchParams);

    const category = searchParams.get("category");
    const skills = searchParams.getAll("skill");
    const minBudget = searchParams.get("min_budget");
    const maxBudget = searchParams.get("max_budget");
    const status = searchParams.get("status") || "active";
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Prisma.JobWhereInput = { status: status as Prisma.EnumJobStatusFilter };

    if (category) {
      where.category = category as Prisma.EnumTalentCategoryFilter;
    }
    if (skills.length > 0) {
      where.requiredSkills = {
        some: { skill: { name: { in: skills, mode: "insensitive" } } },
      };
    }
    if (minBudget) {
      where.budgetMax = { gte: Number(minBudget) };
    }
    if (maxBudget) {
      where.budgetMin = { lte: Number(maxBudget) };
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "budget_desc") orderBy = { budgetMax: "desc" };
    if (sort === "budget_asc") orderBy = { budgetMin: "asc" };
    if (sort === "deadline_soon") orderBy = { deadline: "asc" };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: { select: { fullName: true, clientProfile: { select: { companyName: true } } } },
          requiredSkills: { include: { skill: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        category: j.category,
        budget_min: j.budgetMin,
        budget_max: j.budgetMax,
        deadline: j.deadline,
        status: j.status,
        created_at: j.createdAt,
        client: {
          full_name: j.client.fullName,
          company_name: j.client.clientProfile?.companyName || null,
        },
        required_skills: j.requiredSkills.map((rs) => ({
          name: rs.skill.name,
          is_mandatory: rs.isMandatory,
        })),
      })),
      pagination: buildPaginationMeta(total, page, per_page),
    });
  } catch (error) {
    console.error("[ListJobs]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
