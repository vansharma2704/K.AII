"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Map, Loader2, Play } from 'lucide-react';
import { generateCareerRoadmap } from '@/actions/roadmap';
import RoadmapView from './roadmap-view';
import { motion, Variants } from "framer-motion";

export default function RoadmapGeneratorHero() {
    const [targetRole, setTargetRole] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmapData, setRoadmapData] = useState<any>(null);
    const [error, setError] = useState('');

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
        if (!targetRole) return;
        setIsGenerating(true);
        setError('');
        setRoadmapData(null);

        try {
            const result = await generateCareerRoadmap(targetRole);
            if (result && result.success) {
                setRoadmapData(result.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate roadmap');
        } finally {
            setIsGenerating(false);
        }
    };

    if (roadmapData) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Button 
                    variant="outline" 
                    onClick={() => setRoadmapData(null)}
                    className="mb-8 border-white/10 hover:bg-white/5 rounded-xl font-bold"
                >
                    &larr; Generate Another Roadmap
                </Button>
                <RoadmapView data={roadmapData} />
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto pt-10"
        >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-primary-foreground text-xs font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>The Blueprint to Your Success</span>
            </motion.div>

            <div className="space-y-6">
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                    Architect Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-white drop-shadow-2xl">
                        Career Destiny
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
                    Map out every milestone on your journey to the top. Our AI builds precision roadmaps tailored to your specific career ambitions.
                </motion.p>
            </div>

            <motion.div variants={itemVariants} className="w-full max-w-xl space-y-4 mt-4 relative group">
                <div className="relative flex items-center bg-[#0c0b11]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-all duration-500">
                    <Input
                        placeholder="e.g. Senior Software Architect..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 text-lg px-4 h-14 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={!targetRole || isGenerating}
                        className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all min-w-[140px] active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate <Play className="ml-2 w-4 h-4 fill-current" /></>}
                    </Button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm font-medium">{error}</p>}
            </motion.div>
        </motion.div>
    );
}
