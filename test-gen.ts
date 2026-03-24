import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDbq-LuNPZTjk8bfTuBzY9ZfCmPSzPmIX8";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const MODELS = ["gemma-3-27b-it"];

async function testGen() {
  const industry = "tech-software-development";
  const prompt = `
          Analyze the current state of the ${industry} industry in India and provide insights in ONLY the following JSON format without any additional notes or explanations:
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
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      text = result.response.text();
      if (text) break;
    } catch (err: any) {
      console.error(`Error with model ${modelName}:`, err.message);
      error = err;
    }
  }

  if (!text) {
    console.error('ALL MODELS FAILED:', error?.message);
    process.exit(1);
  }

  console.log('RAW AI TEXT:');
  console.log(text);
    
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    try {
        const parsed = JSON.parse(cleanedText);
        console.log('PARSED JSON:');
        console.log(JSON.stringify(parsed, null, 2));
    } catch (pe) {
        console.error('JSON PARSE FAILED:', (pe as Error).message);
    }
  } catch (error: any) {
    console.error('FAILED:');
    console.error(error.message);
  }
  process.exit(0);
}

testGen();
