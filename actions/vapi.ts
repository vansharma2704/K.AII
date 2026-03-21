"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getVapiAssistantOverrides(targetRole: string, language: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            resume: true,
        }
    });

    if (!user) throw new Error("User not found");

    const userContext = `
Candidate Name: ${user.name || "Candidate"}
${user.resume?.content ? `Resume Content: \n${user.resume.content}` : `Experience: ${user.experience || "some"} years`}
${user.skills?.length ? `Skills: ${user.skills.join(", ")}` : ""}
    `;

    const recruiterPrompt = `
You are a senior hiring manager at a top-tier tech firm. Your goal is to conduct a professional, structured interview for a ${targetRole} position.
The candidate you are interviewing is ${user.name || "the applicant"}.

CONVERSATION RULES:
1. Be professional, direct, and slightly formal.
2. Ask exactly ONE question at a time. Never bundle questions.
3. Wait for the candidate to finish their response before moving on.
4. NEVER provide answers, hints, or feedback during the interview.
5. If the candidate asks for help, politely remind them that this is an assessment.
6. Language: The interview must be conducted in ${language}.

INTERVIEW STRUCTURE:
1. **Welcome**: Briefly welcome the candidate.
2. **Introduction**: Ask the candidate to introduce themselves and their relevant experience for the ${targetRole} role.
3. **Technical Assessment**: Ask 2-3 specific technical questions based on the candidate's background and the target role.
4. **Behavioral**: Ask 1-2 situation-based questions (e.g., "Tell me about a time you faced a challenge...").
5. **Closing**: Thank the candidate and end the session.

${userContext}
    `;

    return {
        assistantOverrides: {
            variableValues: {
                targetRole,
                language
            },
            model: {
                provider: "openai",
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: recruiterPrompt
                    }
                ]
            },
            transcriber: {
                provider: "deepgram",
                model: "nova-2",
                language: language === "English" ? "en-IN" : "en-US",
                keywords: user.name ? user.name.split(" ").filter(w => w.trim() !== "") : ["Vansh"]
            },
            backgroundDenoisingEnabled: false,
            name: "K.AI Hiring Manager"
        }
    };
}
