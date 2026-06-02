import { z } from "zod";

export const registerTalentSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  full_name: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  role: z.literal("talent"),
});

export const registerClientSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  full_name: z.string().min(1, { message: "Nama PIC wajib diisi" }),
  company_name: z.string().min(1, { message: "Nama Perusahaan wajib diisi" }),
  industry: z.string().min(1, { message: "Industri wajib diisi" }),
  whatsapp_number: z.string().min(1, { message: "No WhatsApp wajib diisi" }),
  role: z.literal("client"),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const jobCreateSchema = z.object({
  title: z.string().min(1, { message: "Judul wajib diisi" }),
  description: z.string().min(1, { message: "Deskripsi wajib diisi" }),
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
  bio: z.string().optional(),
  rate_per_hour: z.number().nullable().optional(),
  rate_per_project: z.number().nullable().optional(),
  availability: z.enum(["available", "busy", "unavailable"]).optional(),
  location: z.string().nullable().optional(),
  portfolio_url: z.string().nullable().optional(),
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
