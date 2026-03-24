"use client";

import { motion, Variants } from "framer-motion";
import { HoverEffect } from "@/components/ui/card-hover-effect";

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

interface FeatureItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    link?: string;
}

export default function FeaturesSection({ features }: { features: FeatureItem[] }) {
  return (
    <motion.section 
      id="features" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={revealVariant}
      className="w-full py-20 md:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-primary/20 rounded-full blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-primary/30 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>AI-Powered Tools</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Advanced Tools for the <span className="text-primary">Modern Professional</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Our suite of AI-powered tools is designed to help you succeed in every aspect of your career journey.
          </p>
        </div>
        
        <HoverEffect items={features} className="max-w-7xl mx-auto" />
      </div>
    </motion.section>
  );
}
