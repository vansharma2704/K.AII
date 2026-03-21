"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getIndustryInsights } from "./dashboard";

export async function getCareerInsightsData() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
      resume: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      voiceInterviews: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!user) throw new Error("User not found");

  // If no industry insight, try to get one
  let insights = user.industryInsight;
  if (!insights && user.industry) {
    insights = await getIndustryInsights();
  }

  // Calculate Career Score
  const experience = user.experience || 0;
  const userSkills = user.skills || [];
  const industrySkills = insights?.topSkills || [];
  
  // 1. Skill Match (40%)
  const matchedSkills = userSkills.filter(skill => 
    industrySkills.some(is => is.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(is.toLowerCase()))
  );
  const missingSkills = industrySkills.filter(is => 
    !userSkills.some(us => us.toLowerCase().includes(is.toLowerCase()) || is.toLowerCase().includes(us.toLowerCase()))
  );
  
  const skillScore = industrySkills.length > 0 
    ? (matchedSkills.length / industrySkills.length) * 40 
    : 20;

  // 2. Experience Score (30%)
  // 0 years = 10, 5+ years = 30
  const experienceScore = Math.min(10 + (experience * 4), 30);

  // 3. Assessment/Quiz Score (30%)
  const latestQuizScore = user.assessments[0]?.quizScore || 0;
  const quizScoreWeight = (latestQuizScore / 100) * 30;

  const totalScore = Math.round(skillScore + experienceScore + quizScoreWeight);
  
  // Label based on score
  let label = "Beginner";
  if (totalScore > 75) label = "Advanced";
  else if (totalScore > 45) label = "Intermediate";

  // Mocked salary range based on industry insights if available
  const salaryData = (insights?.salaryRanges as any[])?.find(r => 
    r.role.toLowerCase().includes("engineer") || r.role.toLowerCase().includes("developer") || r.role.toLowerCase().includes("manager")
  ) || (insights?.salaryRanges as any[])?.[0] || { min: 500, max: 1200, median: 800 };

  // Generate 3-5 AI suggestions
  const suggestions = [
    `Master ${missingSkills[0] || "Advanced System Design"} to increase your career score by 15%.`,
    `Your ${matchedSkills[0] || "Core Industry"} skills are strong, consider mentoring others.`,
    `The ${user.industry} sector in India is growing at ${insights?.growthRate || 8}%, keep upskilling!`,
    `Focus on ${insights?.recommendedSkills[0] || "AI Integration"} to stay ahead of market trends.`
  ];

  return {
    user: {
      name: user.name,
      industry: user.industry,
      experience: user.experience,
      skills: user.skills
    },
    careerScore: {
      score: totalScore,
      label,
      breakdown: {
        skills: Math.round(skillScore),
        experience: Math.round(experienceScore),
        quiz: Math.round(quizScoreWeight)
      }
    },
    skillGap: {
      strengths: matchedSkills,
      missing: missingSkills
    },
    nextSteps: [
      {
        title: `Master ${missingSkills[0] || "Advanced Python"}`,
        description: "Focus on industrial applications and advanced libraries to bridge your primary skill gap.",
        icon: "python"
      },
      {
        title: "Build a Portfolio Project",
        description: `Create a real-world application using ${userSkills[0] || "modern frameworks"} to demonstrate your expertise.`,
        icon: "project"
      },
      {
        title: "Complete Industry Assessment",
        description: "Validate your skills with our advanced certifications to boost your profile visibility.",
        icon: "assessment"
      }
    ],
    suggestions,
    salary: {
      range: `₹${Math.round(salaryData.min / 100)}-${Math.round(salaryData.max / 100)} LPA`,
      median: `₹${Math.round(salaryData.median / 100)} LPA`,
      role: salaryData.role
    },
    marketOutlook: insights?.marketOutlook || "POSITIVE"
  };
}
