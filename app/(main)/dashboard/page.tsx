"use client";

import React from "react";
import { getIndustryInsights, getDashboardData } from '@/actions/dashboard';
import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import DashboardView from './_components/DashboardView';
import { motion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

// This is a client-wrapped version to allow animations
export default function IndustryInsightsPage() {
  const [data, setData] = React.useState<{ insights: any, dashboardData: any } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const { isOnboarded } = await getUserOnboardingStatus();
      if (!isOnboarded) {
        window.location.href = '/onboarding';
        return;
      }
      const insights = await getIndustryInsights();
      const dashboardData = await getDashboardData();
      setData({ insights, dashboardData });
      setLoading(false);
    }
    fetchData();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  if (loading || !data) return null;

  return (
    <div className="relative min-h-screen overflow-hidden w-full pt-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-12 pb-20 relative z-10 w-full"
      >
        {/* Header Section - Home Page Style */}
        <div className="text-center space-y-8 pt-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Real-Time Industry Intelligence</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              Executive <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                Analytics Hub
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Monitor your professional progress with state-of-the-art AI insights. Your centralized command center for career domination.
            </motion.p>
          </div>
        </div>

        <motion.div variants={itemVariants}>
          <DashboardView insights={data.insights} dashboardData={data.dashboardData} />
        </motion.div>
      </motion.div>
    </div>
  );
}