import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jobCreateSchema } from "@/lib/validations";

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

    // 3. Bulk insert required skills (Fix N+1)
    await prisma.jobRequiredSkill.createMany({
      data: required_skills.map((sk) => ({
        jobId: job.id,
        skillId: sk.skill_id,
        isMandatory: sk.is_mandatory !== false,
      })),
    });

    // 4. Trigger AI Job Matching in Background (Prevent Timeout)
    const { runAiJobMatching } = await import("@/services/ai-matching");
    runAiJobMatching(job.id, category).catch((err) => {
      console.error("Failed to run background AI matching", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job berhasil diposting. AI sedang mencarikan talenta terbaik di background.",
        data: { job_id: job.id, status: "active" },
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
