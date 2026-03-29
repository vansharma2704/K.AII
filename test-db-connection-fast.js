const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'error', 'warn']
  });

  try {
    console.log('--- DB CONNECTION TEST ---');
    console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1] || 'URL check failed');
    
    // Set a short timeout for the query
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5s')), 5000))
    ]);
    
    console.log('✅ Connection Successful!');
    
    const courses = await prisma.course.findMany({ take: 5 });
    console.log('Latest 5 courses:', JSON.stringify(courses.map(c => ({ id: c.id, name: c.name })), null, 2));

  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    if (error.message.includes('Can\'t reach database server')) {
        console.log('HINT: Your local network or firewall might be blocking port 6543 or 5432.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
