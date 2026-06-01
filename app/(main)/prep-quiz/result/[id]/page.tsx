export const dynamic = "force-dynamic";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, BrainCircuit, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import DeleteQuizButton from "../../_components/delete-quiz-button";

export default async function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId }
    });

    if (!user) redirect("/");

    const assessment = await db.assessment.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!assessment || assessment.userId !== user.id) {
        redirect("/prep-quiz");
    }

    const { quizScore, questions, category, improvementTip } = assessment;
    const qList = questions as any[];
    const totalQuestions = qList.length;
    const attemptedCount = qList.filter(q => q.userAnswer !== null).length;
    const notAttemptedCount = totalQuestions - attemptedCount;
    const correctCount = qList.filter(q => q.isCorrect).length;
    
    // Calculate color based on score
    const isPassing = quizScore >= 70;
    const scoreColor = isPassing ? "text-emerald-500" : "text-amber-500";
    const bgGlow = isPassing ? "bg-emerald-500/10" : "bg-amber-500/10";

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 relative">
            <div className="container max-w-4xl mx-auto px-4 relative z-10">
                
                <div className="flex items-center justify-between mb-8">
                    <Link href="/prep-quiz">
                        <Button variant="ghost" className="text-white/50 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                    
                    <DeleteQuizButton 
                        quizId={resolvedParams.id} 
                        redirectTo="/prep-quiz"
                        variant="ghost"
                        className="text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                    />
                </div>

                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                     <div className="flex-1">
                         <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Quiz Analytics</p>
                         <h1 className="text-3xl md:text-5xl font-black text-white mb-6">{category.replace('Prep Quiz: ', '')}</h1>
                         
                         <div className="grid grid-cols-3 gap-4 md:max-w-md">
                             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                 <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Total</p>
                                 <p className="text-xl font-black text-white">{totalQuestions}</p>
                             </div>
                             <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                 <p className="text-emerald-500/40 text-[10px] font-bold uppercase tracking-wider mb-1">Attempted</p>
                                 <p className="text-xl font-black text-emerald-500">{attemptedCount}</p>
                             </div>
                             <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
                                 <p className="text-red-500/40 text-[10px] font-bold uppercase tracking-wider mb-1">Skipped</p>
                                 <p className="text-xl font-black text-red-500">{notAttemptedCount}</p>
                             </div>
                         </div>
                     </div>

                     <div className={`shrink-0 w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 ${isPassing ? 'border-emerald-500/50' : 'border-amber-500/50'} ${bgGlow} shadow-[0_0_30px_-5px_currentColor]`}>
                          <span className={`text-4xl font-black ${scoreColor}`}>{Math.round(quizScore)}%</span>
                          <span className="text-white/60 text-sm font-medium mt-1">{correctCount} / {totalQuestions}</span>
                     </div>
                </div>

                {/* AI Feedback Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-[#0a0a0a] border-primary/20 shadow-2xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-primary text-xl">
                            <BrainCircuit className="w-5 h-5" /> AI Analysis & Improvement Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-white/80 text-lg leading-relaxed font-medium">
                            {improvementTip}
                        </p>
                    </CardContent>
                </Card>

                {/* Detailed Answers Section */}
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-white/50" /> Question Breakdown
                </h3>

                <div className="space-y-6">
                    {qList.map((q, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl border ${q.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                             
                             <div className="flex items-start gap-4 mb-4">
                                  {q.isCorrect ? (
                                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                  ) : (
                                      <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                  )}
                                  
                                  <div>
                                      <h4 className="text-lg font-bold text-white mb-4">{idx + 1}. {q.question}</h4>
                                      
                                      <div className="space-y-3 mb-6">
                                          {q.options?.map((opt: string, i: number) => {
                                              const isUserAnswer = q.userAnswer === opt;
                                              const isCorrectAnswer = q.answer === opt;
                                              
                                              let blockClass = "bg-white/5 border-white/10 text-white/60";
                                              if (isCorrectAnswer) blockClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 font-bold";
                                              // Highlight wrong user selection
                                              else if (isUserAnswer && !q.isCorrect) blockClass = "bg-red-500/20 border-red-500/50 text-red-100 strike outline-dashed outline-1 outline-red-500/50";

                                              return (
                                                  <div key={i} className={`w-full p-4 rounded-xl border flex items-center justify-between ${blockClass}`}>
                                                       <span>{opt}</span>
                                                       {isUserAnswer && !isCorrectAnswer && <span className="text-xs uppercase tracking-wider text-red-400 font-bold">Your Answer</span>}
                                                       {isCorrectAnswer && <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Correct</span>}
                                                  </div>
                                              )
                                          })}
                                      </div>

                                      <div className="bg-black/40 rounded-xl p-4 border border-white/5 inline-block">
                                          <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-widest text-xs">Explanation</p>
                                          <p className="text-white/80 text-sm leading-relaxed">{q.explanation}</p>
                                      </div>
                                  </div>
                             </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
