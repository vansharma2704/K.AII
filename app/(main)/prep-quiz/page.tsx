import React from 'react';
import { motion, Variants } from "framer-motion";
import { Sparkles, PlusCircle, Target, Award, Clock } from 'lucide-react';
import { getRecentQuizzes } from '@/actions/quiz';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeleteQuizButton from './_components/delete-quiz-button';

export default async function PrepQuizDashboard() {
  const { success, data } = await getRecentQuizzes();
  const recentQuizzes = success ? data : [];

  return (
    <div className='min-h-screen pt-24 pb-20 relative overflow-hidden'>
      <div className='container mx-auto px-4 relative z-10 max-w-6xl space-y-16'>
        {/* Header Section - Home Page Style */}
        <div className="text-center space-y-8 pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Master Your Technical Skillset</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              AI Prep <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                Skill Assessments
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
              Generate hyper-specific mock quizzes strictly tailored to your target roles. Real-time evaluation for the modern professional.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/prep-quiz/start">
                <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg px-12 py-8 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all active:scale-95">
                    <PlusCircle className="mr-3 w-6 h-6 border-none" /> Generate New Test
                </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Assessments</h2>
            
            {recentQuizzes && recentQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentQuizzes.map((quiz: any) => (
                        <div key={quiz.id} className="bg-[#0c0b11]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 cursor-default relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             
                             <div className="relative z-10">
                                 <div className="flex items-center gap-2 mb-4">
                                     <Target className="w-5 h-5 text-primary" />
                                     <h3 className="text-lg font-bold text-white truncate">{quiz.category.replace('Prep Quiz: ', '')}</h3>
                                 </div>
                                 
                                 <div className="flex justify-between items-end mt-6">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-emerald-500" />
                                        <span className="text-emerald-500 font-bold text-2xl">{Math.round(quiz.quizScore)}%</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                         <Link href={`/prep-quiz/result/${quiz.id}`}>
                                            <Button variant="ghost" className="text-xs hover:bg-white/10 h-8 rounded-lg font-bold">View Analytics</Button>
                                        </Link>
                                        <DeleteQuizButton 
                                            quizId={quiz.id} 
                                            showText={false}
                                            className="h-8 w-8 p-0 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        />
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 text-center border overflow-hidden rounded-[2.5rem] border-dashed border-white/10 bg-[#0c0b11]/40 backdrop-blur-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                        <Clock className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">No Quizzes Taken</h3>
                    <p className="text-white/40 max-w-sm mx-auto font-medium">You haven't generated any Prep Quizzes yet. Start your journey by generating your first test!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
