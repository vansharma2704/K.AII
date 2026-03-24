"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

export async function generateCareerRoadmap(targetRole: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const prompt = `
        You are an expert career counselor. The user wants to become a "${targetRole}".
        Create a high-impact, 7-step career roadmap flowchart.
        
        Roadmap Structure:
        1. Start Learning
        2. Fundamentals of the Role
        3. Core Skills
        4. Tools & Technologies
        5. Build Practical Projects
        6. Advanced Skills
        7. Job Ready
        
        You MUST output ONLY valid JSON using exactly this format:
        {
            "role": "${targetRole}",
            "description": "Brief overview of the path.",
            "estimatedTime": "Total time (e.g., 6 months)",
            "phases": [
                {
                    "title": "Start Learning",
                    "description": "Brief intro to the field.",
                    "icon": "LucideIconName (e.g., Rocket, Book, Pencil)",
                    "skillsToLearn": ["Skill 1", "Skill 2", "Skill 3"]
                },
                ... (exactly 7 phases)
            ]
        }

        Rules:
        1. Produce EXACTLY 7 phases following the structure above.
        2. Assign a relevant Lucide icon name to each phase.
        3. Make skills specific to the "${targetRole}" role.
        4. Do NOT include markdown blocks.
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
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            // Validate if parseable
            JSON.parse(text);
            if (text) break;
        } catch (err: any) {
            console.error(`Roadmap error with model ${modelName}:`, err.message);
            error = err;
        }
    }

    if (!text) {
        throw new Error("Failed to generate career roadmap: " + (error?.message || "AI returned empty response."));
    }

    try {
        const parsedJson = JSON.parse(text);
        return {
            success: true,
            data: parsedJson
        };
    } catch (e: any) {
        throw new Error("AI returned invalid data format.");
    }
}
