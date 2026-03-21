"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Coins, IndianRupee } from 'lucide-react'
import { motion } from 'framer-motion'

interface SalaryCardProps {
  range: string
  median: string
  role: string
  score: number
}

const SalaryCard = ({ range, median, role, score }: SalaryCardProps) => {
  const getComparisonInsight = () => {
    if (score > 75) return "You are currently in the top 15% of salaries for this role. Your specialized skills command a premium."
    if (score > 45) return "Your potential salary is slightly above the industry average. Bridging key skill gaps could push you into the top 20%."
    return "You are currently near the entry-level salary range. Strategic upskilling is recommended to reach the industry median."
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="my-10"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-[#050505] to-purple-500/10 border-white/5 rounded-[2.5rem] overflow-hidden group">
        <CardHeader className="pb-8 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white">Salary Prediction</CardTitle>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">AI PROJECTION • {role}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   <IndianRupee className="w-3 h-3" /> Estimated Range
                </p>
                <h4 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                  {range}
                </h4>
              </div>
              <div>
                 <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   <Coins className="w-3 h-3" /> Industry Median
                </p>
                <h4 className="text-2xl font-black text-primary tracking-tight">
                  {median} <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest ml-1">Per Annum</span>
                </h4>
              </div>
            </div>

            <div className="relative">
              {/* Comparison Insight */}
              <div className="mb-6 bg-white/5 border border-white/5 p-4 rounded-2xl">
                 <p className="text-xs font-bold text-white/90 leading-relaxed">
                   <span className="text-primary mr-2 italic font-black">Comparison Insight:</span>
                   "{getComparisonInsight()}"
                 </p>
              </div>

              {/* Visual indicator bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-primary to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                <span>Entry</span>
                <span className={score > 50 ? "text-primary" : "text-white/40"}>Average</span>
                <span>Top 20%</span>
              </div>
              
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-12 h-12" />
                 </div>
                 <p className="text-[11px] text-white/60 leading-relaxed font-medium relative z-10 italic">
                  <span className="text-amber-400 font-bold mr-1">Pro Strategy:</span>
                  Obtaining certificates in cloud-native technologies or system architecture can push your salary towards the upper 20% of this range.
                 </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SalaryCard
