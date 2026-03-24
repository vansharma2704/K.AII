"use server"

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

async function extractTextFromFile(file: File): Promise<string> {
  console.log("Matcher: Reading file ->", file.name, "Type:", file.type, "Size:", file.size);
  if (!file || file.size === 0) return "";

  const chunks = [];
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
  console.log("Matcher: Buffer created, length:", buffer.length);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (e: any) {
      console.error("Matcher PDF parse error:", e);
      throw new Error("Failed to read PDF. The file might be corrupted.");
    }
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const data = await mammoth.extractRawText({ buffer });
      return data.value;
    } catch (e: any) {
      console.error("Matcher DOCX parse error:", e);
      throw new Error("Failed to read DOCX. The file might be corrupted.");
    }
  }
  return "";
}

export async function matchJob(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User not found");

    const resumeFile = formData.get("resumeFile") as File;
    const jdFile = formData.get("jdFile") as File;
    const jdTextPasted = formData.get("jdText") as string;

    // Get resume text
    let resumeText = "";
    if (resumeFile && resumeFile.size > 0) {
      resumeText = await extractTextFromFile(resumeFile);
    } else {
      const existingResume = await db.resume.findUnique({ where: { userId: user.id } });
      if (existingResume) {
        resumeText = existingResume.content;
      }
    }

    if (!resumeText || resumeText.trim().length < 30) {
      throw new Error("Resume content not found. Please upload a resume file.");
    }

    // Get JD text
    let jdText = jdTextPasted || "";
    if (jdFile && jdFile.size > 0) {
      jdText = await extractTextFromFile(jdFile);
    }

    if (!jdText || jdText.trim().length < 50) {
      throw new Error("Job description is too short. Please provide more details.");
    }

    const prompt = `
You are an AI Job Matcher and Career Strategist.
Compare the following Resume with the Job Description.

Resume:
"""
${resumeText.substring(0, 4000)}
"""

Job Description:
"""
${jdText.substring(0, 4000)}
"""

Return a JSON object with EXACTLY this structure (no extra text, no markdown):
{
  "detectedRole": "string (e.g., Frontend Developer)",
  "matchScore": <number 0-100>,
  "requiredSkills": [<string>, ...],
  "matchingSkills": [<string>, ...],
  "missingSkills": [<string>, ...],
  "alignmentSuggestions": [<string>, ...],
  "skillsToLearn": [
    {
      "skill": "string",
      "youtube": "string (representative search link)",
      "docs": "string (official documentation link)",
      "project": "string (specific practice project idea)"
    }
  ],
  "bulletSuggestions": [
    { 
      "original": "string (exact bullet from resume)", 
      "improved": "string (quantified, action-oriented version)", 
      "context": "string (why this change helps)" 
    }
  ]
}

Rules:
- Return ONLY the raw JSON object.
- matchScore is a realistic number 0-100.
- skillsToLearn should match the missingSkills.
- bulletSuggestions should focus on matching the Job Description.
  `.trim();

    let rawText = "";
    let error = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Implement 25s timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`AI Timeout (${modelName})`)), 25000)
        );
        
        const resultPromise = model.generateContent(prompt, { apiVersion: "v1beta" });
        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        
        rawText = result.response.text().trim();
        if (rawText) break;
      } catch (err: any) {
        console.error(`Matcher error with model ${modelName}:`, err.message);
        error = err;
      }
    }

    if (!rawText) {
      throw new Error("Failed to analyze job match: " + (error?.message || "AI returned empty response."));
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in Matcher response:", rawText.substring(0, 500));
      throw new Error("AI returned an unexpected format. Please try again.");
    }

    const matchData = JSON.parse(jsonMatch[0]);

    // Save to DB
    let savedId: string | undefined;
    try {
      const dbAny = db as any;
      const modelRef = dbAny.matchResult || dbAny.jobMatch || dbAny.jobmatch;

      if (modelRef) {
        const saved = await modelRef.create({
          data: {
            userId: user.id,
            jobDescription: jdText.substring(0, 1000),
            detectedRole: matchData.detectedRole || "Unknown Role",
            matchScore: matchData.matchScore || 0,
            requiredSkills: matchData.requiredSkills || [],
            matchingSkills: matchData.matchingSkills || [],
            missingSkills: matchData.missingSkills || [],
            suggestions: matchData.alignmentSuggestions || [],
            skillsToLearn: (matchData.skillsToLearn || []).map((s: any) => s.skill || s),
            bulletSuggestions: matchData.bulletSuggestions || [],
            learningResources: matchData.skillsToLearn || [],
          },
        });
        savedId = saved.id;
      }
    } catch (dbError: any) {
      console.warn("DB save skipped for match:", dbError.message);
    }

    return {
      success: true,
      matchData: {
        ...matchData,
        id: savedId,
      },
    };
  } catch (error: any) {
    console.error("matchJob error:", error);
    throw new Error(error.message || "Failed to compare resume with job description.");
  }
}
