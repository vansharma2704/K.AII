import { Linkedin } from "lucide-react";
import z from "zod/v3";

export const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry"
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization"
  }),
  bio: z.string().max(500).optional(),
  experience: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),
  skills: z.string().transform((val) =>
    val
      ? val
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
      : []
  )
});

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  leetcode: z.string().optional(),
  twitter: z.string().optional(),
})

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  );

export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  organization: z.string().min(1, "Issuing organization is required"),
  date: z.string().optional(),
  credentialId: z.string().optional(),
});

export const publicationSchema = z.object({
  title: z.string().min(1, "Publication title is required"),
  publisher: z.string().min(1, "Publisher is required"),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
  certifications: z.array(certificationSchema).optional().default([]),
  achievements: z.string().optional(),
  languages: z.string().optional(),
});

export const coverLetterSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Target role is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  experience: z.string().min(1, "Experience is required"),
  skills: z.string().min(1, "Skills are required"),
});