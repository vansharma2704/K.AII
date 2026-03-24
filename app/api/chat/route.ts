import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemma-3-27b-it"];

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch user profile for personalization
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        name: true,
        industry: true,
        skills: true,
        bio: true,
        experience: true,
      },
    });

    const userProfileContext = user
      ? `
Context about the user:
- Name: ${user.name || "User"}
- Industry: ${user.industry || "Not specified"}
- Skills: ${user.skills?.join(", ") || "Not specified"}
- Experience: ${user.experience || "Not specified"} years
- Bio: ${user.bio || "Not specified"}
`
      : "";

    const systemPrompt = `
You are K.AI, a professional and encouraging AI career assistant for the "Senpai" platform.
Your goal is to help users with career guidance, resume improvement, skill recommendations, and interview preparation.

Core Personality:
- Professional yet friendly and mentoring.
- Concise and actionable.
- Encouraging and supportive.
- Speak to the user directly (one-to-one). Use their name if available.

${userProfileContext}

Guidelines:
- If asked about careers, provide data-driven insights tailored to their industry/skills if known.
- If asked about resumes, give specific formatting or content tips.
- If asked about interviews, offer behavioral or technical prep advice.
- Use markdown for formatting (bold, lists, etc.).
- Keep responses relatively brief unless a longer explanation is required.
- Do not make up facts.
`.trim();

    // Convert history messages to Gemini format
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    let result = null;
    let error = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContentStream({
          contents,
        }, { apiVersion: "v1beta" });
        if (result) break;
      } catch (err: any) {
        console.error(`Chat error with model ${modelName}:`, err.message);
        error = err;
      }
    }

    if (!result) {
      return new Response(JSON.stringify({ error: "Failed to start chat: " + (error?.message || "All models failed") }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
