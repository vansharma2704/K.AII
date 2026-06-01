export const dynamic = "force-dynamic";

import React from 'react';
import VoiceInterviewer from '../_components/voice-interviewer';
import { ShieldCheck, Sparkles, Bot } from 'lucide-react';

export default async function InterviewSessionPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string; language?: string }>;
}) {
    const sp = await searchParams;
    const targetRole = sp.role || "General Role";
    const language = sp.language || "English";

    return (
        <div className="relative min-h-screen overflow-hidden w-full">
            {/* Elevated deeper dark background with premium grid */}
            <div className="absolute inset-0 bg-[#020202] -z-20" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none -z-10"></div>

            {/* Decorative top ambient glow */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

            <div className="container mx-auto py-6 px-4 md:px-8 relative z-10 hidden md:block mt-6 text-center space-y-4">
                <div className="mx-auto w-fit inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_-3px_var(--color-primary)] text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]"></span>
                    Live Session
                </div>
                <h1 className='text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 leading-[1.1]'>
                    Simulated <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary via-primary/80 to-primary/40 drop-shadow-sm">AI Interview</span>
                </h1>
            </div>

            <div className="container mx-auto px-4 md:px-8 mt-4 md:mt-8 relative z-10 max-w-7xl">
                {/* Elevated Golden Orb matching home page but shifted upwards and made more intense */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Panel */}
                    <div className="hidden lg:flex flex-col gap-4 order-2 lg:order-1">
                        <div className="bg-[#050505]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Bot className="w-32 h-32" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Environment Secure
                            </h3>
                            <ul className="space-y-5 text-sm text-white/70 font-medium relative z-10">
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />Local processing active</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />Real-time deep analysis</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />Secure data transmission</li>
                            </ul>

                            <div className="mt-auto pt-8 relative z-10">
                                <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-inner">
                                    <h4 className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1 mt-1">Target Role</h4>
                                    <p className="text-white text-sm font-semibold">{targetRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Container */}
                    <div className="col-span-1 lg:col-span-2 order-1 lg:order-2 relative overflow-hidden bg-[#050505]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 md:p-12 shadow-[0_0_80px_-15px_rgba(var(--color-primary),0.2)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                        <VoiceInterviewer targetRole={targetRole} language={language} />
                    </div>

                    {/* Right Panel */}
                    <div className="hidden lg:flex flex-col gap-4 order-3">
                        <div className="bg-[#050505]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-xl h-full flex flex-col">
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Best Practices
                            </h3>
                            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-white/5">
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">1</span>
                                    <h4 className="text-white text-sm font-semibold mb-1">Speak explicitly</h4>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">Ensure you communicate clearly so the AI evaluator understands.</p>
                                </div>
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">2</span>
                                    <h4 className="text-white text-sm font-semibold mb-1">Be methodical</h4>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">It's okay to pause briefly to structure complex responses.</p>
                                </div>
                                <div className="relative pl-8">
                                    <span className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">3</span>
                                    <h4 className="text-white text-sm font-semibold mb-1">STAR Method</h4>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">Utilize Situation, Task, Action, and Result for behavioral questions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
