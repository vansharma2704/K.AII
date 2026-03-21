"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface SkillGapSectionProps {
  strengths: string[]
  missing: string[]
}

const SkillGapSection = ({ strengths, missing }: SkillGapSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
      {/* Strengths Column */}
      <motion.div 
        whileHover={{ y: -5, boxShadow: "0 0 25px rgba(16,185,129,0.1)" }}
        className="bg-[#050505]/60 border border-white/5 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
             <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Your Strengths</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Recognized Skills</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {strengths.length > 0 ? strengths.map((skill, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 text-emerald-400 py-2.5 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              {skill}
            </Badge>
          )) : (
            <p className="text-muted-foreground text-xs italic">No matching skills found. Try updating your profile.</p>
          )}
        </div>
      </motion.div>

      {/* Missing Skills Column */}
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 0 25px rgba(244,63,94,0.1)" }}
        className="bg-[#050505]/60 border border-white/5 rounded-[2rem] p-8 hover:border-red-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-500/10 rounded-xl">
             <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Missing Skills</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">High Demand Gaps</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {missing.length > 0 ? missing.map((skill, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="bg-red-500/5 border-red-500/20 text-red-400 py-2.5 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 transition-all"
            >
              {skill}
            </Badge>
          )) : (
            <p className="text-muted-foreground text-xs italic">You're already highly skilled for this industry!</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SkillGapSection
