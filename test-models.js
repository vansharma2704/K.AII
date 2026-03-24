const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
  "gemma-3-27b-it"
];

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  const model = genAI.getGenerativeModel({ model: modelName });
  const start = Date.now();
  try {
    const result = await model.generateContent("Say hello world in one word.", { apiVersion: "v1beta" });
    const text = result.response.text();
    const duration = Date.now() - start;
    console.log(`✅ ${modelName}: "${text.trim()}" in ${duration}ms`);
    return { modelName, success: true, duration };
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message}`);
    return { modelName, success: false, error: error.message };
  }
}

async function runTests() {
  const results = [];
  for (const m of modelsToTest) {
    results.push(await testModel(m));
  }
  console.log("\n--- Summary ---");
  console.table(results);
}

runTests();
