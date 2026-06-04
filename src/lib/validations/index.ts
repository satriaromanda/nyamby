import { z } from "zod";

export const registerTalentSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  full_name: z.string().min(2, { message: "Nama lengkap minimal 2 karakter" }).max(255),
  role: z.literal("talent"),
});

export const registerClientSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  full_name: z.string().min(2, { message: "Nama PIC minimal 2 karakter" }).max(255),
  role: z.literal("client"),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const jobCreateSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter" }).max(255),
  description: z.string().min(20, { message: "Deskripsi minimal 20 karakter" }),
  category: z.enum(["web_dev", "graphic_designer"], { message: "Kategori tidak valid" }),
  budget_min: z.number().nullable().optional(),
  budget_max: z.number().nullable().optional(),
  deadline: z.string().nullable().optional(),
  required_skills: z.array(
    z.object({
      skill_id: z.string(),
      is_mandatory: z.boolean().optional(),
    })
  ).min(1, { message: "Minimal 1 skill wajib diisi" }),
});

export const talentProfileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  rate_per_hour: z.number().nullable().optional(),
  rate_per_project: z.number().nullable().optional(),
  availability: z.enum(["available", "busy", "unavailable"]).optional(),
  location: z.string().nullable().optional(),
  portfolio_url: z.string().nullable().optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip").optional(),
  cv_text: z.string().nullable().optional(),
  portfolio_context: z.string().nullable().optional(),
  skills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "expert"]).optional(),
    })
  ).optional(),
});

export const clientOnboardingSchema = z.object({
  company_name: z.string().max(255).optional(),
  industry: z.enum(["technology", "creative", "retail", "finance", "education", "other"], {
    message: "Industri wajib dipilih",
  }),
  company_size: z.enum(["1-10", "11-50", "51-200", "200+"]).optional(),
  location: z.string().min(2, { message: "Lokasi wajib diisi" }),
  description: z.string().optional(),
  website_url: z.string().url({ message: "Format URL tidak valid" }).optional().or(z.literal("")),
  whatsapp_number: z.string().optional(),
});

export const clientProfileUpdateSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  company_name: z.string().max(255).optional(),
  industry: z.enum(["tech", "creative", "retail", "f&b", "education", "other"]).optional(),
  company_size: z.enum(["solo", "2-10", "11-50", "51+"]).optional(),
  location: z.string().min(2).optional(),
  description: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  whatsapp_number: z.string().optional(),
  avatar_url: z.string().optional(),
});

