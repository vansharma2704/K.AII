const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const key = process.env.GEMINI_API_KEY;
console.log("Using API Key:", key ? `${key.substring(0, 8)}...` : "none");

const genAI = new GoogleGenerativeAI(key || "");

const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemma-3-27b-it"
];

async function testModel(modelName, apiVersion) {
  const versionStr = apiVersion ? `(${apiVersion})` : "(default)";
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const options = apiVersion ? { apiVersion } : undefined;
    const start = Date.now();
    const result = await model.generateContent("Say hello world in one word.", options);
    const text = result.response.text();
    const duration = Date.now() - start;
    console.log(`✅ ${modelName} ${versionStr}: "${text.trim()}" in ${duration}ms`);
    return { modelName, version: versionStr, success: true, duration, error: "" };
  } catch (error) {
    console.log(`❌ ${modelName} ${versionStr} failed: ${error.message}`);
    return { modelName, version: versionStr, success: false, duration: 0, error: error.message };
  }
}

async function runTests() {
  const results = [];
  console.log("\n--- Testing without apiVersion parameter ---");
  for (const m of modelsToTest) {
    results.push(await testModel(m, undefined));
  }
  
  console.log("\n--- Testing with apiVersion: 'v1' ---");
  for (const m of modelsToTest) {
    results.push(await testModel(m, "v1"));
  }

  console.log("\n--- Testing with apiVersion: 'v1beta' ---");
  for (const m of modelsToTest) {
    results.push(await testModel(m, "v1beta"));
  }

  console.log("\n--- Summary ---");
  console.table(results);
}

runTests();

