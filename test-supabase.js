const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const url = (process.env.SUPABASE_URL || "").trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();

console.log("URL:", JSON.stringify(url));
console.log("Anon Key:", JSON.stringify(anonKey));
console.log("Length:", anonKey.length);

async function run() {
  try {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`❌ Failed:`, error.message);
    } else {
      console.log(`✅ Succeeded! Buckets:`, data.map(b => b.name));
    }
  } catch (e) {
    console.log(`❌ Threw error:`, e.message);
  }
}

run();
