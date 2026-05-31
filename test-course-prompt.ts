import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemma-3-27b-it"];

async function run() {
  const topic = "React Native";
  const level = "Beginner";
  const prompt = `
        You are an expert curriculum designer. The user wants to learn about: "${topic}" at a "${level}" level.
        Design a highly structured, comprehensive syllabus for a video course.

        You MUST output ONLY valid JSON using exactly this format:
        {
            "name": "Course Title",
            "description": "A 2-sentence description of the course.",
            "totalChapters": 3,
            "chapters": [
                {
                    "chapterId": "guid-style-string",
                    "chapterTitle": "Chapter 1 Title",
                    "chapterDescription": "Brief description of the chapter",
                    "subTopics": [
                        "Subtopic 1",
                        "Subtopic 2",
                        "Subtopic 3"
                    ]
                }
            ]
        }

        Important rules:
        1. Produce exactly between 2 and 5 chapters.
        2. Each chapter should have exactly 2-4 subTopics.
        3. Do NOT include markdown blocks like \`\`\`json, just pure JSON text.
        4. "chapterId" should be a unique string (you can generate random IDs).
  `;

  for (const m of MODELS) {
    console.log(`\nTesting model: ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const start = Date.now();
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`✅ Success with ${m} in ${Date.now() - start}ms!`);
      console.log("Output prefix:", text.substring(0, 150));
    } catch (e: any) {
      console.log(`❌ Failed with ${m}:`, e.message);
    }
  }
}

run();
