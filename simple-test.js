const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = "AIzaSyDbq-LuNPZTjk8bfTuBzY9ZfCmPSzPmIX8"; // From test-gen.ts
const genAI = new GoogleGenerativeAI(key);

async function run() {
  const modelName = "gemini-1.5-flash";
  console.log(`Testing ${modelName}...`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}

run();
