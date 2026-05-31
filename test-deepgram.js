const { createClient } = require("@deepgram/sdk");
require("dotenv").config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

async function run() {
  console.log("Testing Deepgram buffer transcription...");
  // Create a 1-second dummy audio buffer or load one if we want,
  // or just send a dummy 100-byte buffer to see if the SDK call is correct.
  const dummyBuffer = Buffer.alloc(1000);
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      dummyBuffer,
      { model: "nova-2", smart_format: true, words: true }
    );
    console.log("Success! Result keys:", Object.keys(result || {}));
  } catch (e) {
    console.log("Error type/message:", e.message);
  }
}

run();
