const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

async function run() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  console.log("--- Querying JWT Secret from Postgres Config ---");
  try {
    const secret = await prisma.$queryRawUnsafe("SELECT current_setting('postgrest.jwt_secret', true) as secret;");
    console.log("Result:", JSON.stringify(secret, null, 2));
  } catch (e) {
    console.log("Failed:", e.message);
  }

  await prisma.$disconnect();
}

run();
