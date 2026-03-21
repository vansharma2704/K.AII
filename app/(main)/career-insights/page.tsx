"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCareerInsightsData } from '@/actions/career'
import CareerScoreCircle from './_components/CareerScoreCircle'
import SkillGapSection from './_components/SkillGapSection'
import NextStepsSection from './_components/NextStepsSection'
import SuggestionsList from './_components/SuggestionsList'
import SalaryCard from './_components/SalaryCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Sparkles, Loader2, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const CareerInsightsPage = () => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [loadingStep, setLoadingStep] = useState(0)

    const loadingTexts = [
        "Analyzing your profile...",
        "Evaluating your skills...",
        "Matching industry trends...",
        "Calculating your career score..."
    ]

    const fetchData = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true)
            setLoadingStep(0)
        }
        
        try {
            const result = await getCareerInsightsData()
            setData(result)
        } catch (error) {
            console.error("Failed to fetch career insights:", error)
        }

        if (showLoading) {
            setTimeout(() => {
                setLoading(false)
            }, 2600)
        }
    }

    useEffect(() => {
        fetchData()

        // Handle loading sequence text animations
        const interval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev < loadingTexts.length - 1) return prev + 1
                return prev
            })
        }, 700)

        return () => clearInterval(interval)
    }, [])

    const handleReanalyse = () => {
        fetchData(true)
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                </div>
                <div className="mt-10 h-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={loadingStep}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-white/70 text-lg font-black tracking-tight"
                        >
                            {loadingTexts[loadingStep]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="min-h-screen bg-[#030207] text-white pt-24 pb-20 px-4 md:px-8 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="hover:bg-white/5 -ml-2 text-muted-foreground hover:text-white transition-colors group">
                                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                            </Button>
                        </Link>
                        
                        <Button 
                            onClick={handleReanalyse}
                            variant="outline" 
                            className="rounded-[1.25rem] bg-[#0a0a0a] border-white/10 hover:border-primary/40 text-sm font-black uppercase tracking-[0.2em] gap-3 group transition-all h-14 px-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:scale-[1.02] active:scale-95"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000 text-primary" />
                            Re-analyze Profile
                        </Button>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                AI Career Analysis
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                                Career <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white">Insights</span>
                            </h1>
                            <p className="text-muted-foreground mt-4 max-w-xl font-medium text-lg leading-relaxed">
                                AI-powered analysis of your career profile in the <span className="text-white">{data.user.industry}</span> industry.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Score Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/5 border border-white/5 rounded-[3rem] p-4 md:p-10 mb-16 relative overflow-hidden group"
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="flex flex-col items-center">
                            <CareerScoreCircle 
                                score={data.careerScore?.score || 0} 
                                label={data.careerScore?.label || "Beginner"} 
                            />
                            {/* Primary CTA */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 2 }}
                                className="mt-8 w-full max-w-sm"
                            >
                                <Link href="/courses" className="block">
                                    <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-black text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 group/btn active:scale-95">
                                        🚀 Improve My Score 
                                        <ChevronLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                        <div className="space-y-8 px-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-white tracking-tight">Score Breakdown</h2>
                                <p className="text-white/50 text-sm font-medium">Detailed analysis of your professional standing</p>
                            </div>
                            <div className="space-y-6">
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🧠</span>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Skill Match</span>
                                        </div>
                                        <span className="text-primary font-black text-lg">{data.careerScore.breakdown.skills}<span className="text-white/20 text-xs ml-1">/40</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.careerScore.breakdown.skills / 40) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">💼</span>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Experience Depth</span>
                                        </div>
                                        <span className="text-primary font-black text-lg">{data.careerScore.breakdown.experience}<span className="text-white/20 text-xs ml-1">/30</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                         <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.careerScore.breakdown.experience / 30) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🎯</span>
                                            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Assessment Performance</span>
                                        </div>
                                        <span className="text-primary font-black text-lg">{data.careerScore.breakdown.quiz}<span className="text-white/20 text-xs ml-1">/30</span></span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                         <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(data.careerScore.breakdown.quiz / 30) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "circOut", delay: 0.4 }}
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </motion.section>

                {/* Skill Gaps */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="mb-16"
                >
                    <SkillGapSection 
                        strengths={data.skillGap?.strengths || []} 
                        missing={data.skillGap?.missing || []} 
                    />
                </motion.div>

                {/* Next Steps Roadmap */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mb-16"
                >
                    <NextStepsSection steps={data.nextSteps || []} />
                </motion.div>

                {/* Suggestions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mb-16"
                >
                    <SuggestionsList suggestions={data.suggestions || []} />
                </motion.div>

                {/* Salary Projection */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mb-24"
                >
                    <SalaryCard 
                        range={data.salary?.range || "N/A"} 
                        median={data.salary?.median || "N/A"} 
                        role={data.salary?.role || "N/A"} 
                        score={data.careerScore?.score || 0}
                    />
                </motion.div>

            </div>
        </div>
    )
}

export default CareerInsightsPage
