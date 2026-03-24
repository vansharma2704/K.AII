import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODELS = ["gemma-3-27b-it"];

export async function GET(request: Request) {
    // Vercel secures cron routes using a secret if CRON_SECRET is configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log("CRON: Starting weekly Industry Insights generation...");

        const industriesResult = await db.industryInsight.findMany({
            select: { industry: true }
        });

        const updatedIndustries = [];

        // Note: In a massive database this loop could hit Vercel timeout limits
        // but for a few industries it will execute fine.
        for (const { industry } of industriesResult) {
            console.log(`CRON: Analyzing industry: ${industry}`);

            const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

            let text = "";
            let error = null;

            for (const modelName of MODELS) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(prompt, { apiVersion: "v1beta" });
                    text = result.response?.text() || "";
                    if (text) break;
                } catch (err: any) {
                    console.error(`CRON error with model ${modelName} for ${industry}:`, err.message);
                    error = err;
                }
            }

            if (!text) {
                console.error(`CRON: Failed to generate insights for ${industry} after all models.`);
                continue;
            }
            const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

            try {
                const insights = JSON.parse(cleanedText);

                await db.industryInsight.update({
                    where: { industry },
                    data: {
                        ...insights,
                        lastUpdated: new Date(),
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
                    }
                });
                console.log(`CRON: Successfully updated ${industry}`);
                updatedIndustries.push(industry);
            } catch (parseError) {
                console.error(`CRON: Failed to parse Gemini JSON for ${industry}:`, parseError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully updated insights for: ${updatedIndustries.join(', ')}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("CRON: Failed to generate industry insights:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to generate industry insights."
        }, { status: 500 });
    }
}
