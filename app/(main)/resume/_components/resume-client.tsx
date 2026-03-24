"use client";

import ResumeBuilder from './resume-builder';
import { motion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import React from 'react';

export default function ResumeClient({ resume }: { resume: any }) {
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
            <span>AI-Driven Career Document Studio</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              Resume <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                Intelligence Engine
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Craft a world-class, ATS-optimized resume with real-time AI guidance. Engineered specifically for the modern hiring landscape.
            </motion.p>
          </div>
        </div>

        <motion.div variants={itemVariants} className="relative z-10 w-full">
          <ResumeBuilder
            initialContent={resume?.content}
            initialFormData={resume?.formData}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
