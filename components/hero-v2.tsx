"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield, Target, Star } from "lucide-react";
import { Button } from "./ui/button";

const HeroV2 = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                    {/* Left Content - Balanced Split */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full lg:w-1/2 space-y-10"
                    >
                        {/* Premium Badge */}
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <span>The Future of Career Intelligence</span>
                        </motion.div>

                        {/* Main Heading - Refined Size */}
                        <div className="space-y-6 text-center lg:text-left">
                            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                                Master Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                                    Professional Destiny
                                </span>
                            </motion.h1>
                            
                            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0"> 
                                Experience the next evolution of career coaching. Driven by state-of-the-art AI, K.AI provides the strategic edge you need to dominate the modern job market.
                            </motion.p>
                        </div>

                        {/* Action Buttons */}
                         <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                             <Link href="/dashboard">
                                 <Button size="lg" className="group px-10 h-16 rounded-2xl bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-950 text-white border-t border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] transition-all duration-500 hover:scale-110 active:scale-95 text-lg font-black flex items-center gap-3">
                                    🚀 Start Your Journey
                                    <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button size="lg" variant="outline" className="px-10 h-16 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all duration-500 text-lg font-bold">
                                    Learn More
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Social Proof Section */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-8">
                            <div className="flex -space-x-3 mb-2 sm:mb-0">
                                {[
                                    "https://randomuser.me/api/portraits/women/75.jpg",
                                    "https://randomuser.me/api/portraits/men/75.jpg",
                                    "https://randomuser.me/api/portraits/women/74.jpg"
                                ].map((src, i) => (
                                    <div key={i} className="relative w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-black/50">
                                        <Image 
                                            src={src} 
                                            alt={`User ${i + 1}`} 
                                            fill 
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center lg:items-start">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                                        ))}
                                    </div>
                                    <span className="text-white font-bold text-sm tracking-tight text-shadow-sm">Best in Class</span>
                                </div>
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                                    Trusted by <span className="text-white">10k+ Professionals</span>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Visual - Pure Glow Effects (No Border) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end relative group"
                    >
                        {/* Deep Ambient Background Glow (Strictly Behind) */}
                        <div className="absolute -inset-24 bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
                        
                        {/* Secondary Core Glow - Concentrated behind image */}
                        <div className="absolute inset-4 bg-primary/30 rounded-3xl blur-[60px] opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-700" />
                        
                        {/* Image Card - Pure & Sharp with Deep Multi-Layer Shadow */}
                        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3),0_0_20px_rgba(168,85,247,0.2)] transform-gpu">
                            <Image 
                                src="/career_new.png" 
                                alt="Senpai AI Career Platform" 
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroV2;
