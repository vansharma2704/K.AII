"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Star, Zap } from 'lucide-react'

interface CareerScoreCircleProps {
  score: number
  label: string
}

const CareerScoreCircle = ({ score, label }: CareerScoreCircleProps) => {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 500)
    return () => clearTimeout(timer)
  }, [score])

  const getStatusBg = () => {
    if (score > 75) return "bg-emerald-500"
    if (score > 45) return "bg-amber-500"
    return "bg-rose-500"
  }

  const getStatusShadow = () => {
    if (score > 75) return "rgba(16,185,129,0.5)"
    if (score > 45) return "rgba(245,158,11,0.5)"
    return "rgba(244,63,94,0.5)"
  }

  const getInsightText = () => {
    if (score > 75) return "You are in the elite tier. Your profile is highly competitive for top-tier global roles."
    if (score > 45) return "You are close to becoming job-ready. Focus on improving key missing skills to increase your marketability."
    return "Your profile needs strategic upskilling. Focus on the missing core industry skills identified below."
  }

  const getIcon = () => {
    if (score > 75) return <Award className="w-5 h-5 text-emerald-400" />
    if (score > 45) return <Zap className="w-5 h-5 text-amber-400" />
    return <Star className="w-5 h-5 text-rose-400" />
  }

  const getLabelColor = () => {
    if (score > 75) return "text-emerald-400"
    if (score > 45) return "text-amber-400"
    return "text-rose-400"
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-10 scale-105 transition-transform duration-700">
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Animated Background Glow */}
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`absolute inset-0 rounded-full blur-[80px] ${score > 75 ? 'bg-emerald-500/20' : score > 45 ? 'bg-amber-500/20' : 'bg-rose-500/20'}`} 
        />
        
        {/* SVG Circle with Extra Glow */}
        <svg className={`w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_${getStatusShadow()}]`}>
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            className="text-white/5"
          />
          <motion.circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={score > 75 ? "text-emerald-500" : score > 45 ? "text-amber-500" : "text-rose-500"}
            strokeLinecap="round"
            style={{ filter: "url(#glow)" }}
          />
        </svg>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-1"
              >
                {animatedScore}
              </motion.span>
              <div className="h-px w-12 bg-white/20 mb-2" />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md`}
              >
                <div className={`w-1.5 h-1.5 rounded-full animate-ping ${getStatusBg()}`} />
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-white/70`}>
                  {label} Level
                </span>
              </motion.div>
          </div>
        </div>
      </div>
      
      {/* Percentage Job-Ready text */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-center"
      >
        <p className="text-xl font-black text-white">
          You are <span className={score > 75 ? "text-emerald-500" : score > 45 ? "text-amber-500" : "text-rose-500"}>{score}%</span> job-ready
        </p>
        <p className="mt-2 text-muted-foreground text-xs font-medium max-w-[280px] mx-auto leading-relaxed italic opacity-80">
          "{getInsightText()}"
        </p>
      </motion.div>
      
      {/* Beginner | Intermediate | Advanced labels */}
      <div className="flex items-center gap-4 mt-8 px-8 py-3 rounded-2xl bg-[#0a0a0a]/50 border border-white/5 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
         
         <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${score <= 45 ? 'opacity-100 scale-110' : 'opacity-30'}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${score <= 45 ? 'text-rose-500' : 'text-white'}`}>Beginner</span>
            <div className={`h-1 w-8 rounded-full ${score <= 45 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-white/10'}`} />
            <AnimatePresence>
                {score <= 45 && (
                    <motion.div 
                        layoutId="level-underline" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-0.5 w-4 bg-rose-500/50 mt-0.5 rounded-full" 
                    />
                )}
            </AnimatePresence>
         </div>
         <div className="w-px h-6 bg-white/10" />
         <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${score > 45 && score <= 75 ? 'opacity-100 scale-110' : 'opacity-30'}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${score > 45 && score <= 75 ? 'text-amber-500' : 'text-white'}`}>Intermediate</span>
            <div className={`h-1 w-12 rounded-full ${score > 45 && score <= 75 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`} />
            <AnimatePresence>
                {score > 45 && score <= 75 && (
                    <motion.div 
                        layoutId="level-underline" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-0.5 w-6 bg-amber-500/50 mt-0.5 rounded-full" 
                    />
                )}
            </AnimatePresence>
         </div>
         <div className="w-px h-6 bg-white/10" />
         <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${score > 75 ? 'opacity-100 scale-110' : 'opacity-30'}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${score > 75 ? 'text-emerald-500' : 'text-white'}`}>Advanced</span>
            <div className={`h-1 w-8 rounded-full ${score > 75 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
            <AnimatePresence>
                {score > 75 && (
                    <motion.div 
                        layoutId="level-underline" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-0.5 w-4 bg-emerald-500/50 mt-0.5 rounded-full" 
                    />
                )}
            </AnimatePresence>
         </div>
      </div>

      <p className="mt-8 text-muted-foreground text-xs font-medium max-w-[240px] text-center leading-relaxed">
        Your score is based on your current skills, experience, and industry relevance.
      </p>
    </div>
  )
}

export default CareerScoreCircle
