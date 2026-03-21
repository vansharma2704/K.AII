"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { generateCourseLayout } from '@/actions/course';
import { useRouter } from 'next/navigation';
import { motion, Variants } from "framer-motion";

export default function CourseGeneratorHero() {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const router = useRouter();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setProgress(5);
        setStatusText("Designing Course Syllabus with AI...");

        try {
            const layoutResult = await generateCourseLayout(topic, level);
            const { course, courseId } = layoutResult;
            setProgress(20);

            const chapters = course.layout as any[];
            const chapterCount = chapters.length;
            let completed = 0;

            const batchSize = 2;
            for (let i = 0; i < chapterCount; i += batchSize) {
                const batch = chapters.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(async (chapter) => {
                        setStatusText(`Generating: ${chapter.chapterTitle}...`);
                        const fetchRes = await fetch('/api/generate-video-content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                courseId: course.courseId,
                                chapterId: chapter.chapterId,
                                subTopics: chapter.subTopics
                            })
                        });

                        if (!fetchRes.ok) {
                            const err = await fetchRes.json();
                            throw new Error(err.error || "Failed to generate chapter content");
                        }
                        completed++;
                        setProgress(20 + (completed / chapterCount) * 80);
                    })
                );
            }

            setStatusText("Course generated successfully!");
            setProgress(100);

            setTimeout(() => {
                router.refresh();
                router.push(`/courses/${courseId}/preview`);
            }, 1000);

        } catch (error: any) {
            console.error("Generation failed:", error);
            setStatusText(`Error: ${error.message}`);
            setIsGenerating(false);
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto pt-10"
        >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>The Future of Learning</span>
            </motion.div>

            <div className="space-y-6">
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                    Master Any <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                        Skill Instantly
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
                    Our AI researches the topic, builds the curriculum, voices the narration, and renders your personalized video course in seconds.
                </motion.p>
            </div>

            {!isGenerating ? (
                <motion.div variants={itemVariants} className="w-full max-w-xl space-y-6 mt-4">
                    <div className="flex items-center justify-center gap-3">
                        {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${level === l
                                    ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <div className="relative flex items-center bg-[#0c0b11]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-all duration-500">
                            <Input
                                placeholder="e.g. Advanced Quantum Computing..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 text-lg px-4 h-14 focus-visible:ring-0 focus-visible:ring-offset-0"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <Button
                                size="lg"
                                onClick={handleGenerate}
                                disabled={!topic || isGenerating}
                                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                            >
                                Generate <Play className="ml-2 w-4 h-4 fill-current" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="w-full max-w-xl mt-8 space-y-6">
                    <div className="p-10 rounded-[2.5rem] bg-[#0c0b11]/80 backdrop-blur-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-400 to-transparent" />
                        <div className="flex flex-col items-center gap-8">
                            {progress < 100 ? (
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] rounded-full" />
                            )}

                            <div className="w-full space-y-4">
                                <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                                    <span className="text-white/60">{statusText}</span>
                                    <span className="text-primary">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3 bg-white/5 rounded-full overflow-hidden" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
