"use client";
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import ThreeBackground from './three-background'
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion'
import { FloatingElements } from './floating-elements'
import React from 'react'

const HeroSection = () => {
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <section className="relative w-full pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden bg-[#030207]" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {/* 3D Background */}
            <ThreeBackground />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
            
            <div className='container mx-auto px-4 relative z-10'>
                <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto'>
                    {/* Left Content */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='space-y-8'
                    >
                        {/* Small badge */}
                        <motion.div variants={itemVariants} className='inline-flex items-center gap-2 px-3 py-1 text-xs text-primary font-semibold uppercase tracking-wider border border-primary/30 rounded-full bg-primary/10'>
                            <span className='w-2 h-2 rounded-full bg-primary animate-pulse'></span>
                            <span>AI-POWERED CAREER INTELLIGENCE</span>
                        </motion.div>

                        {/* Main Heading */}
                        <div className='space-y-6'>
                            <motion.h1 variants={itemVariants} className='text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white'>
                                Elevate Your Career 
                                <br />
                                <span className='text-primary inline-block relative'>
                                    With K.AI
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ delay: 1, duration: 1.2, ease: "easeInOut" }}
                                        className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-transparent rounded-full"
                                    />
                                </span>
                            </motion.h1>
                            
                            <motion.p variants={itemVariants} className='text-base md:text-lg text-gray-400 leading-relaxed max-w-xl'> 
                                Personalized mentoring, real-time resume analysis, and interview intelligence. Senpai is your ultimate career companion, built on state-of-the-art AI.
                            </motion.p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                             <Link href={"/dashboard"}>
                                <Button size={"lg"} className='group px-10 h-14 rounded-xl bg-gradient-to-r from-primary via-purple-500 to-violet-600 hover:from-primary/90 hover:via-purple-500/90 hover:to-violet-600/90 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] text-lg font-bold flex items-center gap-3'>
                                    Unlock Your Potential
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href={"#features"}>
                                <Button size={"lg"} className='px-10 h-14 rounded-xl text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-white/5' variant={"outline"}>
                                    Learn More
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Social proof */}
                        <motion.div variants={itemVariants} className='flex items-center gap-4 pt-4'>
                            <div className='flex -space-x-3 items-center'>
                                {[
                                    "https://randomuser.me/api/portraits/women/75.jpg",
                                    "https://randomuser.me/api/portraits/men/75.jpg",
                                    "https://randomuser.me/api/portraits/women/74.jpg"
                                ].map((url, i) => (
                                    <div 
                                        key={i} 
                                        className="relative w-9 h-9 rounded-full border-2 border-[#030207] transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer shadow-sm overflow-hidden"
                                    >
                                        <Image
                                            src={url}
                                            alt={`Professional ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className='text-sm text-gray-500 font-medium'>
                                Join <span className="text-white font-bold">10k+</span> professionals scaling careers
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Right Visual - 3D Tilt & Image */}
                    <div className='relative hidden lg:block perspective-1000 group'>
                        <FloatingElements />
                        
                        <motion.div 
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: "preserve-3d"
                            }}
                            className='relative aspect-square rounded-3xl max-w-[580px] mx-auto z-10'
                        >
                            {/* Premium double border/glow */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-violet-600 rounded-[2.5rem] blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="absolute -inset-[2px] bg-gradient-to-br from-white/20 to-transparent rounded-[2.2rem] pointer-events-none" />
                            
                            <div className='relative w-full h-full rounded-[2.2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_-15px_rgba(168,85,247,0.3)] bg-[#030207]/60 backdrop-blur-xl'>
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/career_new.png"
                                        alt="AI Career Insights"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    {/* Dynamic gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#030207]/40 via-transparent to-primary/5 pointer-events-none" />
                                </div>
                                
                                {/* Inner corner glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] opacity-40 pointer-events-none" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection