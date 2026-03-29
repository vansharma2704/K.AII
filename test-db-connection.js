const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    const usersCount = await prisma.user.count();
    console.log('Number of users:', usersCount);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
