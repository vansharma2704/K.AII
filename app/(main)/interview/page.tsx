"use client";

import { getVoiceInterviews } from '@/actions/interview';
import VoiceInterviewFlow from './_components/voice-interview-flow';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { InterviewsGrid } from './_components/interviews-grid';
import { motion, Variants } from "framer-motion";
import React from 'react';

export default function InterviewPage() {
  const [interviews, setInterviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const data = await getVoiceInterviews();
      setInterviews(data);
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

  if (loading) return null;

  return (
    <div className="relative min-h-screen overflow-hidden w-full pt-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto space-y-16 pb-20 relative z-10 w-full"
      >
        {/* Header Section - Home Page Style */}
        <div className="text-center space-y-8 pt-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>AI-Powered Performance Simulator</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              Conquer Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                Interview Session
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the next evolution of interview prep. Our advanced engine adapts to your target role in real-time, providing actionable feedback.
            </motion.p>
          </div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {/* Features list */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
              <span className="text-sm font-semibold text-white/80">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
              <span className="text-sm font-semibold text-white/80">Hyper-Realistic AI</span>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <VoiceInterviewFlow>
            <InterviewsGrid interviews={interviews} setInterviews={setInterviews} />
          </VoiceInterviewFlow>
        </motion.div>
      </motion.div>
    </div>
  );
}