"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const MODELS = ["gemma-3-27b-it"];

export async function generateCoverLetter(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, industry: true, bio: true } // Selective fetch for speed
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Write a professional cover letter for a ${data.role} position at ${data.companyName}.
    
    Candidate Data:
    - Name: ${data.fullName}
    - Industry: ${user.industry || "General"}
    - Exp: ${data.experience} yrs
    - Skills: ${data.skills}
    - Background: ${user.bio || "N/A"}
    
    Job: ${data.jobDescription}
    
    Specs:
    - Tone: Professional & Focused
    - Max 400 words
    - Markdown only (No preamble/postscript)
    - Highlight achievements and fit
  `;

  let content = "";
  let error = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      // Use a consistent 45s timeout for Gemma
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`AI Timeout (${modelName})`)), 45000)
      );

      const resultPromise = model.generateContent(prompt);
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;

      content = result.response.text().trim();
      if (content) break;
    } catch (err: any) {
      console.error(`Error with model ${modelName}:`, err.message);
      error = err;
    }
  }

  if (!content) {
    throw new Error("Failed to generate cover letter: " + (error?.message || "AI returned empty response."));
  }

  try {
    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.role,
        fullName: data.fullName,
        experience: data.experience,
        skills: data.skills,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error: any) {
    console.error("Error saving cover letter to DB:", error.message);
    throw new Error("Failed to save cover letter");
  }
}

export async function regenerateCoverLetter(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existing = await db.coverLetter.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!existing || existing.user.clerkUserId !== userId) {
    throw new Error("Cover letter not found");
  }

  // Use existing data to generate again
  return await generateCoverLetter({
    role: existing.jobTitle,
    companyName: existing.companyName,
    jobDescription: existing.jobDescription,
    fullName: existing.fullName,
    experience: existing.experience,
    skills: existing.skills
  });
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}