"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  FileText,
  PenBox,
  GraduationCap,
  BrainCircuit,
  Video,
  Map,
  ArrowRight,
  Sparkles,
  Target
} from "lucide-react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ToolCard = ({ tool }: { tool: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group h-full transition-transform duration-200"
    >
      <Link href={tool.href} className="block h-full">
        <Card className="relative h-full bg-[#050505]/80 backdrop-blur-xl border-white/10 group-hover:border-primary/50 group-hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.4)] transition-all duration-700 rounded-[2.5rem] overflow-hidden flex flex-col p-2 transform-gpu">
          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
          
          <CardHeader className="relative z-10 p-8" style={{ transform: "translateZ(50px)" }}>
            <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-700">
              <tool.icon className={`w-8 h-8 ${tool.iconColor} group-hover:text-white transition-colors`} />
            </div>
            <CardTitle className="text-2xl font-black text-white group-hover:text-primary transition-colors">{tool.title}</CardTitle>
            <CardDescription className="text-muted-foreground font-medium leading-relaxed mt-4 group-hover:text-white/80 transition-colors">
              {tool.description}
            </CardDescription>
          </CardHeader>

          <div className="mt-auto p-8 pt-0 relative z-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-700">
              Launch Assistant <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

const tools = [
  {
    title: "Resume Builder",
    description: "Craft a professional, ATS-optimized resume with AI guidance.",
    href: "/resume",
    icon: FileText,
    color: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400"
  },
  {
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters for any job description in seconds.",
    href: "/ai-cover-letter",
    icon: PenBox,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  },
  {
    title: "Mock Interview",
    description: "Practice with our AI recruiter to ace your real-world interviews.",
    href: "/interview",
    icon: GraduationCap,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    title: "Interview Prep Quiz",
    description: "Test your technical knowledge with industry-specific mock exams.",
    href: "/prep-quiz",
    icon: BrainCircuit,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  },
  {
    title: "Course Generator",
    description: "Generate comprehensive learning paths tailored to your career goals.",
    href: "/courses",
    icon: Video,
    color: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400"
  },
  {
    title: "Career Roadmap",
    description: "AI that understands your skills and builds your career roadmap.",
    href: "/roadmap",
    icon: Map,
    color: "from-primary/20 to-purple-500/20",
    iconColor: "text-primary"
  },
  {
    title: "ATS Resume Analyzer",
    description: "Deep-dive scan of your resume PDF for ATS compatibility and gaps.",
    href: "/resume/analyzer",
    icon: Sparkles,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  },
  {
    title: "AI Job Matcher",
    description: "Compare your resume against any job description for role alignment.",
    href: "/resume/job-matcher",
    icon: Target,
    color: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400"
  }
];

export default function ToolsPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
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
        className="container mx-auto space-y-16 pb-20 relative z-10 w-full"
      >
        {/* Header Section - Home Page Style */}
        <div className="text-center space-y-8 pt-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>The Power of AI at Your Fingertips</span>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                Intelligence Suite
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the next evolution of career tools. Our integrated AI ecosystem provides everything you need to dominate the modern job market.
            </motion.p>
          </div>
        </div>

        {/* Tools Grid with Ambient Glows */}
        <div className="relative">
          {/* Ambient Glows from Home Page Hero */}
          <div className="absolute -inset-24 bg-primary/20 rounded-full blur-[120px] opacity-25 pointer-events-none" />
          <div className="absolute inset-40 bg-purple-500/10 rounded-full blur-[100px] opacity-20 pointer-events-none -right-20 top-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {tools.map((tool, index) => (
              <motion.div key={index} variants={itemVariants}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

