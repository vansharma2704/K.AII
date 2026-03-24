"use client"
import { IndustryInsight } from '@prisma/client'
import { TrendingDown, TrendingUp, LineChart, Sparkles, GraduationCap, Trophy, Brain, BriefcaseIcon, Clock, ArrowRight } from 'lucide-react';
import React, { useMemo, memo } from 'react'
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
    insights: IndustryInsight;
    dashboardData: {
        user: { name: string | null; industry: string | null };
        completion: {
            hasResume: boolean;
            hasPrepQuiz: boolean;
            hasMockInterview: boolean;
            hasCourse: boolean;
        };
        analytics: {
            totalInterviews: number;
            avgInterviewScore: number;
            latestQuizScore: number;
            lastInterviewDate: Date | null;
        }
    }
}

interface SalaryRange {
    role: string;
    min: number;
    max: number;
    median: number;
    location: string;
}

const getDemandLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
        case "high": return "bg-green-500";
        case "medium": return "bg-yellow-500";
        case "low": return "bg-red-500";
        default: return "bg-gray-500";
    }
}

const getMarketOutlookInfo = (outlook: string) => {
    switch (outlook.toLowerCase()) {
        case "positive": return { icon: TrendingUp, color: "text-green-500" };
        case "neutral": return { icon: LineChart, color: "text-yellow-500" };
        case "negative": return { icon: TrendingDown, color: "text-red-500" };
        default: return { icon: LineChart, color: "text-gray-500" };
    }
}

const DashboardView = memo(({ insights, dashboardData }: DashboardViewProps) => {
    const { analytics } = dashboardData;
    
    const salaryData = useMemo(() => {
        const salaryRanges = (insights?.salaryRanges || []) as unknown as SalaryRange[];
        return salaryRanges.map((range) => {
            const normalize = (val: number) => {
                if (!val) return 0;
                if (val > 100000) return Math.round(val / 1000); 
                if (val > 0 && val < 200) return Math.round(val * 100); 
                return val;
            };

            return {
                name: range?.role,
                min: normalize(range?.min),
                max: normalize(range?.max),
                median: normalize(range?.median),
            };
        });
    }, [insights?.salaryRanges]);

    const { OutlookIcon, OutlookColor } = useMemo(() => {
        const info = getMarketOutlookInfo(insights.marketOutlook);
        return { OutlookIcon: info.icon, OutlookColor: info.color };
    }, [insights.marketOutlook]);

    const lastUpdateDate = useMemo(() => 
        format(new Date(insights.lastUpdated), "dd/MM/yyyy"), 
    [insights.lastUpdated]);

    const nextUpdateDistance = useMemo(() => 
        formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }),
    [insights.nextUpdate]);

    return (
        <div className='space-y-12 w-full max-w-7xl mx-auto pb-20'>
            
            {/* 1. ANALYTICS HEADER & PERSONAL STATS */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pt-10">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                        Professional Dashboard
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        Career <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-violet-600">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground mt-3 max-w-xl font-medium">
                        Real-time AI-powered insights, industry benchmarks, and performance metrics for <span className="text-white">{insights.industry}</span>.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant={"outline"} className="border-white/10 bg-[#111] text-muted-foreground px-4 py-1.5 rounded-full">
                        Last Intel Sync: {lastUpdateDate}
                    </Badge>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="relative rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary font-black px-6 py-5 transition-all duration-500 group" 
                        onClick={() => window.location.href = '/onboarding'}
                    >
                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <span className="relative z-10 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Edit Profile
                        </span>
                    </Button>
                </div>
            </div>

            {/* 2. ANALYTICS ROW */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                <Card className="bg-[#050505]/80 border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-4">Total Interviews</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black text-white">{analytics.totalInterviews}</span>
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#050505]/80 border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-4">Avg. Interview Score</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black text-white">{analytics.avgInterviewScore || 0}%</span>
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#050505]/80 border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-4">Latest Quiz Score</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black text-white">{analytics.latestQuizScore || 0}%</span>
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#050505]/80 border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white mb-2 leading-tight">🚀 Analyze your Career</h3>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4">
                            Discover your Career Score & Skill Gaps
                        </p>
                    </div>
                    <Button 
                        size="sm" 
                        className="relative w-full bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary font-black rounded-xl transition-all duration-500 group/btn shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_-2px_rgba(168,85,247,0.6)]" 
                        onClick={() => window.location.href = '/career-insights'}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Analyse Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </Card>
            </section>

            {/* 3. INDUSTRY DYNAMICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                 <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sector Growth</span>
                     </div>
                     <div className='text-3xl font-black text-white'>{insights.growthRate.toFixed(1)}%</div>
                     <Progress value={insights.growthRate} className='mt-4 h-1 bg-white/5' />
                 </Card>

                 <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors text-white">
                            <BriefcaseIcon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Labor Demand</span>
                     </div>
                     <div className='text-3xl font-black text-white capitalize'>{insights.demandLevel}</div>
                     <div className={`h-1 w-full rounded-full mt-4 ${getDemandLevelColor(insights.demandLevel)} shadow-[0_0_10px_currentColor]`} />
                 </Card>

                 <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors text-primary">
                            <Brain className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Priority Skills</span>
                     </div>
                     <div className='flex flex-wrap gap-1.5'>
                        {insights.topSkills.slice(0, 8).map((skill: string) => (
                            <Badge key={skill} variant={"secondary"} className="bg-white/5 text-[10px] uppercase font-black tracking-widest">{skill}</Badge>
                        ))}
                     </div>
                 </Card>

                 <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 rounded-3xl p-6 group hover:border-primary/30 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors text-muted-foreground">
                            <Clock className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Next Refresh</span>
                    </div>
                    <div className='text-xl font-black text-white uppercase'>{nextUpdateDistance}</div>
                 </Card>
            </div>

            {/* 4. SALARY BENCHMARKS */}
            <div className="px-4">
                <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-white">Industry Salary Benchmarks</CardTitle>
                                <CardDescription className="text-muted-foreground font-medium">Estimated yearly compensation (Scale: ₹ Thousands INR)</CardDescription>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={salaryData} 
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    barGap={6}
                                    barCategoryGap={30}
                                >
                                    <defs>
                                        <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="medianGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#444" 
                                        tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                                        interval={0}
                                        textAnchor="middle"
                                        dy={10}
                                        height={60}
                                    />
                                    <YAxis 
                                        stroke="#444" 
                                        tick={{ fontSize: 10, fill: '#666' }}
                                        tickFormatter={(value) => `₹${value}k`}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[220px]">
                                                        <p className="text-white font-black mb-3 border-b border-white/10 pb-2 text-sm uppercase tracking-wider">{label}</p>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-tighter">Min Salary</span>
                                                                </div>
                                                                <span className="text-emerald-400 font-black text-sm">₹{data.min}k</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                                                    <span className="text-primary text-[10px] font-black uppercase tracking-tighter">Median Salary</span>
                                                                </div>
                                                                <span className="text-white font-black text-sm">₹{data.median}k</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(var(--secondary),0.5)]" />
                                                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-tighter">Max Salary</span>
                                                                </div>
                                                                <span className="text-purple-400 font-black text-sm">₹{data.max}k</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar 
                                        dataKey="min" 
                                        fill="url(#minGradient)" 
                                        radius={[4, 4, 0, 0]} 
                                        minPointSize={6}
                                        className="transition-all duration-300"
                                    />
                                    <Bar 
                                        dataKey="median" 
                                        fill="url(#medianGradient)" 
                                        radius={[4, 4, 0, 0]} 
                                        minPointSize={10}
                                        className="transition-all duration-300"
                                    />
                                    <Bar 
                                        dataKey="max" 
                                        fill="url(#maxGradient)" 
                                        radius={[4, 4, 0, 0]} 
                                        minPointSize={6}
                                        className="transition-all duration-300"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 5. AI CAREER INSIGHTS SECTION */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 px-4'>
                <Card className="bg-[#050505]/60 backdrop-blur-xl border-white/5 rounded-3xl p-8 border hover:border-white/10 transition-all">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-primary" /> Market Trends
                    </h3>
                    <ul className='space-y-6'>
                        {insights.keyTrends.map((trend, index) => (
                            <li key={index} className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5'>
                                <div className='h-2 w-2 mt-2 rounded-full bg-primary shrink-0 shadow-[0_0_10px_var(--color-primary)]'></div>
                                <span className="text-white/70 text-sm leading-relaxed">{trend}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="bg-[#050505]/60 backdrop-blur-xl border-white/5 rounded-3xl p-8 border hover:border-white/10 transition-all">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" /> Skills for the Future
                    </h3>
                    <div className='flex flex-wrap gap-2 mb-8'>
                        {insights.recommendedSkills.map((skill: string) => (
                            <Badge key={skill} variant={"secondary"} className="bg-primary/5 border-primary/10 text-primary py-2 px-4 rounded-xl font-bold hover:bg-primary/10 transition-all uppercase tracking-widest text-[9px]">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> K.AI Career Move
                        </h4>
                        <p className="text-xs text-white/50 leading-relaxed font-medium">
                            The market is shifting heavily towards <span className="text-primary font-bold">{insights.recommendedSkills[0]}</span>. Updating your resume with projects in this area could significantly reduce your job search duration.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
});

export default DashboardView