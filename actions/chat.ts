"use server"

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

export async function chatWithAssistant(message: string, context: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are an AI Career Assistant. The user has just performed a Job Match analysis.
Context of the latest analysis:
- Role: ${context.detectedRole || "Unknown"}
- Match Score: ${context.matchScore}%
- Missing Skills: ${context.missingSkills?.join(", ") || "None"}
- Matching Skills: ${context.matchingSkills?.join(", ") || "None"}

User Question: "${message}"

Rules:
- Give short, actionable career advice.
- Focus on how to improve the match score for this specific role.
- Be encouraging and professional.
- Use markdown for formatting.
- Keep the response under 150 words.
  `.trim();

  let text = "";
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

      text = result.response.text();
      if (text) break;
    } catch (err: any) {
      console.error(`Chat error with model ${modelName}:`, err.message);
      error = err;
    }
  }

  if (!text) {
    throw new Error("Failed to get response from AI assistant: " + (error?.message || "AI returned empty response."));
  }
  return text;
}
