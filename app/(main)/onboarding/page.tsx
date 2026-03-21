import { industries } from '@/data/industries'
import React from 'react'
import OnBoardingForm from './_components/onboarding-form'
import { db } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const OnboardingPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  });

  return (
    <main className="relative min-h-screen overflow-hidden w-full pt-20">
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 flex flex-col items-center justify-center">
        {/* Center Golden Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-in fade-in duration-1000" />

        <OnBoardingForm industries={industries} initialData={user} />
      </div>
    </main>
  )
}

export default OnboardingPage