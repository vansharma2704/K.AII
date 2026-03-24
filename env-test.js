const { GoogleGenerativeAI } = require("@google/generative-ai");

const key = "AIzaSyClhdpb5nxlXGH422UKOKZq_8wFb5bqO80"; // From .env
const genAI = new GoogleGenerativeAI(key);

async function run() {
  const models = ["gemini-1.5-flash", "gemma-3-27b-it"];
  for (const m of models) {
    console.log(`Testing ${m}...`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("say 'ok'");
      console.log(`${m} Success:`, result.response.text());
    } catch (e) {
      console.log(`${m} Error:`, e.message);
    }
  }
}

run();
