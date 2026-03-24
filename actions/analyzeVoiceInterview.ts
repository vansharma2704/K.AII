"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

export async function analyzeVoiceInterview(
    transcript: string,
    chatHistory: { role: string; text: string }[],
    targetRole: string,
    language: string
) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    if (!transcript || transcript.trim().length < 5) {
        // If the conversation was too short, mark it as failed or skipped
        const voiceInterview = await db.voiceInterview.create({
            data: {
                userId: user.id,
                targetRole,
                language,
                transcript: transcript || "No transcript collected.",
                chatHistory: chatHistory as unknown as Prisma.InputJsonValue[],
                status: "FAILED",
                detailedFeedback: "The interview was too short to generate meaningful feedback."
            }
        });
        return voiceInterview.id;
    }

    const prompt = `
  You are an expert technical hiring manager evaluating an interview transcript for the role of "${targetRole}" conducted in "${language}".
  
  Read the transcript below carefully. You MUST return ONLY a valid, raw JSON object. Do not include markdown formatting, backticks, or any conversational text.
  
  The JSON object MUST EXACTLY match this structure:
  {
    "technicalScore": <number between 0 and 100 representing technical knowledge demonstrated>,
    "communicationScore": <number between 0 and 100 representing clarity and professional communication>,
    "confidenceScore": <number between 0 and 100 representing confidence and assertiveness>,
    "strengths": ["<string: positives of the interviewee>", ... max 3],
    "improvements": ["<string: improvements to be made>", ... max 3],
    "keyPoints": ["<string: key points about what happened in the interview>", ... max 3]
  }

  IMPORTANT INSTRUCTIONS:
  - Deeply analyze the entire transcript without bias before generating your feedback.
  - "strengths": Focus exclusively on the positives of the interviewee based on your deep analysis.
  - "improvements": Focus exclusively on the actionable improvements the interviewee must make.
  - "keyPoints": Briefly summarize the most vital topics that were covered or happened in the interview.
  - All three arrays must contain extremely concise strings (1 short sentence max each).
  - Provide exactly 2 to 3 bullet points for each array.

  Transcript:
  ${transcript}
  `;

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
            console.error(`Voice analysis error with model ${modelName}:`, err.message);
            error = err;
        }
    }

    if (!text) {
        throw new Error("Failed to analyze transcript: " + (error?.message || "AI returned empty response."));
    }
    console.log("Raw Response from Gemini:", text);

        // Strip out any markdown code blocks or hidden characters that Gemini might occasionally inject
        text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        console.log("Cleaned Text:", text);

    let metrics;
    try {
        metrics = JSON.parse(text);
        console.log("Parsed Metrics:", metrics);
    } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", parseError);
        console.log("Falling back to default metrics due to JSON parse error.");
        metrics = {
            technicalScore: 0,
            communicationScore: 0,
            confidenceScore: 0,
            strengths: ["Failed to generate specific strengths."],
            improvements: ["Failed to generate specific improvements."],
            keyPoints: ["Could not parse the AI response."]
        };
    }

    const voiceInterview = await db.voiceInterview.create({
        data: {
            userId: user.id,
            targetRole,
            language,
            transcript,
            chatHistory: chatHistory as unknown as Prisma.InputJsonValue[],
            status: "COMPLETED",
            technicalScore: parseFloat(metrics?.technicalScore) || 50,
            communicationScore: parseFloat(metrics?.communicationScore) || 50,
            confidenceScore: parseFloat(metrics?.confidenceScore) || 50,
            strengths: Array.isArray(metrics?.strengths) ? metrics.strengths : ["Failed to generate specific strengths."],
            improvements: Array.isArray(metrics?.improvements) ? metrics.improvements : ["Failed to generate specific improvements."],
            keyPoints: Array.isArray(metrics?.keyPoints) ? metrics.keyPoints : ["Could not parse the AI response."],
            detailedFeedback: "See bullet points."
        }
    });

    return voiceInterview.id;
}
