import { db } from './lib/prisma';

async function check() {
  try {
    const insight = await db.industryInsight.findUnique({
      where: { industry: 'tech-software-development' }
    });
    console.log('INSIGHT FOUND:', !!insight);
    if (insight) {
      console.log('SALARY RANGES COUNT:', insight.salaryRanges.length);
      console.log('TRENDS COUNT:', insight.keyTrends.length);
    }
    
    const users = await db.user.findMany({
      where: { industry: 'tech-software-development' },
      take: 5
    });
    console.log('USERS COUNT:', users.length);
  } catch (e) {
    console.error('ERROR:', (e as Error).message);
  }
  process.exit(0);
}

check();
