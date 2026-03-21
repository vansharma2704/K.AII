"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Code, BookOpen, GraduationCap, Laptop } from 'lucide-react'

interface NextStep {
  title: string
  description: string
  icon: string
}

interface NextStepsSectionProps {
  steps: NextStep[]
}

const NextStepsSection = ({ steps }: NextStepsSectionProps) => {
  const icons: any = {
    python: Code,
    project: Laptop,
    assessment: GraduationCap,
    code: Code
  }

  return (
    <div className="my-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
           <h3 className="text-2xl font-black text-white tracking-tight leading-none">What to Do Next</h3>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5">Your Personalized Roadmap</p>
        </div>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 hidden md:block" />

        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = icons[step.icon] || Code
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex flex-col md:flex-row gap-8 items-start md:items-center group"
              >
                {/* Step Indicator */}
                <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                   <div className="relative z-10">
                      <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                   </div>
                   {/* Step Number Badge */}
                   <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-[10px] font-black flex items-center justify-center border-2 border-[#030207] text-white">
                      {index + 1}
                   </div>
                </div>

                <div className="flex-1 space-y-1 pt-1">
                   <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors duration-300">{step.title}</h4>
                   <p className="text-white/50 text-sm font-medium leading-relaxed max-w-2xl">{step.description}</p>
                </div>

                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                   <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                      <span>Start Now</span>
                      <ArrowRight className="w-5 h-5" />
                   </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default NextStepsSection
