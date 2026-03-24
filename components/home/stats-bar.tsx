"use client";

import { motion, Variants } from "framer-motion";

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const stats = [
  { label: "Success Rate", value: "98%" },
  { label: "Active Users", value: "10k+" },
  { label: "Industries", value: "50+" },
  { label: "AI Support", value: "24/7" },
];

export default function StatsBar() {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={revealVariant}
      className="w-full py-16 md:py-20 border-y border-primary/20 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,174,63,0.03),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-2 group cursor-pointer relative p-6 rounded-2xl glass border-white/5">
              <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform duration-300 relative z-10">{stat.value}</h3>
              <p className="text-sm text-gray-500 uppercase tracking-wider relative z-10">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
