"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const MODELS = ["gemma-3-27b-it"];

export const generateAIInsight = async (industry: string | null) => {

    if (!industry) {
        throw new Error("Industry is required");
    }

    // Convert slug (e.g., "tech-software-development") to readable title
    // for better AI understanding.
    const readableIndustry = industry
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const prompt = `
          Analyze the current state of the ${readableIndustry} industry in India and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": [
              "Detailed trend 1 with 2-3 sentences of context",
              "Detailed trend 2 with 2-3 sentences of context"
            ],
            "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"]
          }
          
          CRITICAL SALARY INSTRUCTIONS (INDIAN MARKET - THOUSANDS FORMAT):
          1. Provide salary ranges ONLY in Indian Rupees (₹) and FORMATTED IN THOUSANDS (k).
          2. The 'min', 'max', and 'median' fields must be clean numbers representing thousands (e.g., use 1200 for ₹1200k).
          3. LOGICAL ORDERING IS REQUIRED: Minimum Salary < Median Salary < Maximum Salary.
          4. UNIQUE VALUES: Every role MUST have its own unique salary benchmark. DO NOT reuse numbers across roles.
          5. Salaries must reflect realistic Indian industry demand and trends for the ${industry} sector.
          
          INSIGHT DEPTH INSTRUCTIONS:
          - Provide at least 5-6 distinct keyTrends. Each trend must be a mini-paragraph (25-40 words) offering real value and context.
          - Identify 8-10 recommendedSkills that are actually relevant for ${industry} growth.
          
          ROLE SELECTION:
          - Identify 5-6 standard, key roles typical for the ${industry} industry.
          - CRITICAL: If the industry is NOT related to Technology/Software, DO NOT include roles like "Software Engineer", "Developer", "DevOps", etc.
          - Instead, focus on roles specific to ${industry} (e.g., for Finance: "Investment Banker", "Risk Analyst", "Accountant").
          - Ensure roles are diverse (Entry-level to Senior/Management).
          
          Return ONLY the raw JSON.
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
            console.error(`Dashboard insight error with model ${modelName}:`, err.message);
            error = err;
        }
    }

    if (!text) {
        throw new Error("Failed to generate industry insights: " + (error?.message || "AI returned empty response."));
    }
    
    try {
        // Robust JSON extraction: Find the first '{' and last '}'
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start === -1 || end === -1) {
            throw new Error("AI did not return a valid JSON object");
        }
        
        const cleanedText = text.substring(start, end + 1);
        return JSON.parse(cleanedText);
    } catch (parseError: any) {
        console.error("AI Insight Parse Error:", parseError.message);
        console.error("Raw AI Response:", text);
        throw new Error("Failed to parse industry insights. Please try again.");
    }
}

export async function getIndustryInsights() {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        },
        include: {
            industryInsight: true // Include the relation
        }
    });

    if (!user) throw new Error("User not found");

    // If user already has industry insight, check if it needs updating
    if (user.industryInsight) {
        const now = new Date();
        const nextUpdate = new Date(user.industryInsight.nextUpdate);
        
        // Regenerate ONLY if nextUpdate date has passed
        if (now >= nextUpdate) {
            const insights = await generateAIInsight(user.industry);
            const updatedInsight = await db.industryInsight.update({
                where: {
                    id: user.industryInsight.id
                },
                data: {
                    industry: user.industry!,
                    ...insights,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
                }
            });
            return updatedInsight;
        }

        return user.industryInsight;
    }

    // If no industry insight exists and user has an industry, create one
    if (user.industry) {
        const insights = await generateAIInsight(user.industry);
        const industryInsight = await db.industryInsight.upsert({
            where: { industry: user.industry },
            update: {
                ...insights,
                lastUpdated: new Date(),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            create: {
                industry: user.industry,
                ...insights,
                lastUpdated: new Date(),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
            }
        });

        return industryInsight;
    }

    throw new Error("User does not have an industry set");
}

export async function getDashboardData() {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            resume: true,
            assessments: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            voiceInterviews: {
                orderBy: { createdAt: 'desc' },
            },
            courses: {
                take: 1
            }
        }
    });

    if (!user) throw new Error("User not found");

    // Calculate Completion Status
    const completion = {
        hasResume: !!user.resume,
        hasPrepQuiz: user.assessments.length > 0,
        hasMockInterview: user.voiceInterviews.length > 0,
        hasCourse: user.courses.length > 0,
        // For roadmap, we'll assume it exists if they have a course or if we had a dedicated table (which we don't, it might be in courses or just generated)
        // Actually roadmap was implemented as a generic view, so we might just track it if we added a record.
        // For now let's use what we have.
    };

    // Calculate Analytics
    const totalInterviews = user.voiceInterviews.length;
    const avgInterviewScore = totalInterviews > 0
        ? user.voiceInterviews.reduce((acc, curr) => acc + (curr.technicalScore || 0) + (curr.communicationScore || 0), 0) / (totalInterviews * 2) 
        : 0;
    
    const latestQuizScore = user.assessments[0]?.quizScore || 0;
    const lastInterviewDate = user.voiceInterviews[0]?.createdAt || null;

    return {
        user: {
            name: user.name,
            industry: user.industry
        },
        completion,
        analytics: {
            totalInterviews,
            avgInterviewScore: Math.round(avgInterviewScore),
            latestQuizScore: Math.round(latestQuizScore),
            lastInterviewDate
        }
    };
}