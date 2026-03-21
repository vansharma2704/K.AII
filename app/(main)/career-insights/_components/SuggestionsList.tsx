"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Lightbulb, TrendingUp, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface SuggestionsListProps {
  suggestions: string[]
}

const SuggestionsList = ({ suggestions }: SuggestionsListProps) => {
  const icons = [Sparkles, Target, TrendingUp, Lightbulb]

  return (
    <div className="space-y-6 my-12">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        <h3 className="text-2xl font-black text-white tracking-tight">AI Improvement Strategy</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => {
          const Icon = icons[index % icons.length]
          return (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#050505]/60 border-white/5 hover:border-primary/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.1)] transition-all duration-300 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all duration-500">
                    <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Recommendation {index + 1}</p>
                    <p className="text-sm text-white/90 leading-relaxed font-semibold">
                      {suggestion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SuggestionsList
