"use server"

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

export async function analyzeResume(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();
    console.log("Scanner: Starting analysis for user:", clerkUserId);
    
    if (!clerkUserId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User not found");

    console.log("Scanner: Attempting to get 'resumeFile' from formData...");
    const file = formData.get("resumeFile") as File;
    console.log("Scanner: File object from formData:", file ? "Exists" : "MISSING");
    
    if (!file || file.size === 0) {
      console.error("Scanner Error: No file found in FormData or file is empty");
      throw new Error("Resume file not found in the upload. Please select a file and try again.");
    }

    console.log("Scanner: File properties -> Name:", file.name, "Type:", file.type, "Size:", file.size);

    console.log("Scanner: Reading file content via stream...");
    const chunks = [];
    const reader = file.stream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    console.log("Scanner: Data converted to Buffer, total length:", buffer.length);
    
    if (buffer.length === 0) {
      throw new Error("The uploaded file appears to be empty. Please check the file and try again.");
    }

    let resumeText = "";

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");

    if (isPdf) {
      try {
        console.log("Scanner: Parsing PDF...");
        const data = await pdf(buffer);
        console.log("Scanner: PDF parsed successfully, text length:", data.text?.length);
        resumeText = data.text;
      } catch (e: any) {
        console.error("Scanner: PDF parse failed:", e);
        throw new Error("Failed to read PDF file. Please ensure it's not password protected.");
      }
    } else if (isDocx) {
      try {
        console.log("Scanner: Parsing DOCX...");
        const data = await mammoth.extractRawText({ buffer });
        console.log("Scanner: DOCX parsed successfully, text length:", data.value?.length);
        resumeText = data.value;
      } catch (e: any) {
        console.error("Scanner: DOCX parse failed:", e);
        throw new Error("Failed to read DOCX file. It might be corrupted.");
      }
    } else {
      console.warn("Scanner: Unsupported file type detected ->", file.type, "Name:", file.name);
      throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
    }

    if (!resumeText || resumeText.trim().length < 50) {
      console.warn("Scanner: Resume text too short:", resumeText?.length);
      throw new Error("The resume appears to be empty or too short for analysis.");
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyst and career coach.
Analyze the following resume and return a comprehensive JSON analysis.

Resume Text:
"""
${resumeText.substring(0, 8000)}
"""

Industry: ${user.industry || "General"}

Return ONLY a raw JSON object with EXACTLY this structure (no markdown, no explanation):
{
  "atsScore": <overall number 0-100>,
  "breakdown": {
    "formatting": <number 0-100>,
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>
  },
  "missingKeywords": [<string>, <string>, ...],
  "skillGaps": [<string>, ...],
  "improvementTips": [<string>, ...],
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "bulletSuggestions": [
    { "original": "<exact bullet text from resume>", "improved": "<enhanced version with metrics and action verbs>" },
    { "original": "<exact bullet text from resume>", "improved": "<enhanced version with metrics and action verbs>" },
    { "original": "<exact bullet text from resume>", "improved": "<enhanced version with metrics and action verbs>" }
  ]
}

Guidelines:
- atsScore and breakdown scores must be realistic (not all above 90).
- missingKeywords: 5-8 specific tech keywords/tools missing from the resume.
- bulletSuggestions: pick 3 actual bullets from the resume and rewrite them with quantified results, strong action verbs, and STAR format. If no bullets found, suggest 3 generic improvements.
- Keep all arrays concise (3-6 items each).
- Return ONLY the JSON, nothing else.
  `.trim();

    let rawText = "";
    let error = null;

    for (const modelName of MODELS) {
      try {
        console.log(`Scanner: Calling AI with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Implement 25s timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`AI Timeout (${modelName})`)), 25000)
        );
        
        const resultPromise = model.generateContent(prompt, { apiVersion: "v1beta" });
        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        
        rawText = result.response.text().trim();
        if (rawText) {
          console.log(`Scanner: AI responded successfully using ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.error(`Scanner error with model ${modelName}:`, err.message);
        error = err;
      }
    }

    if (!rawText) {
      throw new Error("Failed to analyze resume: " + (error?.message || "AI returned empty response."));
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in AI response:", rawText.substring(0, 500));
      throw new Error("AI returned an unexpected format. Please try again.");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Normalize all fields with fallbacks
    if (typeof analysis.atsScore !== "number") analysis.atsScore = 0;
    analysis.breakdown = analysis.breakdown || { formatting: 0, keywords: 0, experience: 0, skills: 0 };
    analysis.breakdown.formatting = analysis.breakdown.formatting || 0;
    analysis.breakdown.keywords = analysis.breakdown.keywords || 0;
    analysis.breakdown.experience = analysis.breakdown.experience || 0;
    analysis.breakdown.skills = analysis.breakdown.skills || 0;
    analysis.missingKeywords = analysis.missingKeywords || [];
    analysis.skillGaps = analysis.skillGaps || [];
    analysis.improvementTips = analysis.improvementTips || [];
    analysis.strengths = analysis.strengths || [];
    analysis.weaknesses = analysis.weaknesses || [];
    analysis.bulletSuggestions = analysis.bulletSuggestions || [];

    // Try to save to DB silently
    try {
      const dbAny = db as any;
      const modelRef = dbAny.resumeAnalysis || dbAny.atsAnalysis || dbAny.aTSAnalysis;
      if (modelRef) {
        await modelRef.create({
          data: {
            userId: user.id,
            score: analysis.atsScore,
            missingKeywords: analysis.missingKeywords,
            skillGaps: analysis.skillGaps,
            suggestions: analysis.improvementTips,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
          },
        });
      }
    } catch (dbError: any) {
      console.warn("DB save skipped:", dbError.message);
    }

    return { success: true, analysis };
  } catch (error: any) {
    console.error("analyzeResume error:", error);
    throw new Error(error.message || "Failed to analyze resume. Please try again.");
  }
}

export async function getLatestAnalysis() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("User not authenticated");
  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  try {
    const dbAny = db as any;
    const modelRef = dbAny.resumeAnalysis || dbAny.atsAnalysis || dbAny.aTSAnalysis;
    if (!modelRef) return null;
    return await modelRef.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  } catch {
    return null;
  }
}
