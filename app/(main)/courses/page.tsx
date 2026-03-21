import React from 'react';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import CourseGeneratorHero from './_components/course-generator-hero';
import CourseDashboard from './_components/course-dashboard';

export default async function CoursesPage() {
    const { userId } = await auth();

    let courses: any[] = [];
    if (userId) {
        const user = await db.user.findUnique({ where: { clerkUserId: userId } });
        if (user) {
            courses = await db.course.findMany({
                where: { createdBy: user.id },
                orderBy: { createdAt: 'desc' }
            });
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden w-full text-white pt-24">
            <div className="container mx-auto py-8 px-4 md:px-8 relative z-10 max-w-7xl space-y-24">
                <CourseGeneratorHero />

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">Your Generated Courses</h2>
                    <CourseDashboard courses={courses} />
                </div>
            </div>
        </div>
    );
}
