const { PrismaClient } = require('@prisma/client');

async function debugData() {
  const prisma = new PrismaClient();

  try {
    console.log('--- DATA DEBUG ---');
    
    const latestCourse = await prisma.course.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!latestCourse) {
      console.log('No courses found in database.');
      return;
    }
    
    console.log('Latest Course:', {
        id: latestCourse.id,
        courseId: latestCourse.courseId,
        name: latestCourse.name,
        chaptersCount: (latestCourse.layout || []).length
    });
    
    const slides = await prisma.courseSlide.findMany({
      where: { courseId: latestCourse.courseId }
    });
    
    console.log(`Found ${slides.length} slides for course ${latestCourse.courseId}`);
    
    if (slides.length > 0) {
        console.log('First Slide Sample:', JSON.stringify({
            slideIndex: slides[0].slideIndex,
            heading: slides[0].slideData?.heading,
            audioUrl: !!slides[0].audioUrl
        }, null, 2));
    } else {
        console.log('HINT: Course exists but has NO slides. Generation likely failed or is still in progress.');
    }

  } catch (error) {
    console.error('Debug failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugData();
