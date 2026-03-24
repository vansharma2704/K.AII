"use client"

import { useState, useRef } from "react"
import { matchJob } from "@/actions/matcher"
import { chatWithAssistant } from "@/actions/chat"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { 
    Briefcase, 
    FileCheck, 
    CheckCircle2, 
    XCircle,
    Brain,
    Lightbulb,
    Target,
    Loader2,
    Sparkles,
    RefreshCw,
    PlayCircle,
    BookOpen,
    Code2,
    ChevronDown,
    Send,
    MessageSquare,
    Copy,
    Check,
    HelpCircle,
    Info,
    History,
    Wand2
} from "lucide-react"
import { toast } from "sonner"

// ────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────

function MatchProgressRing({ score }: { score: number }) {
  const r = 80
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  
  return (
    <div className="w-52 h-52 relative">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          <filter id="matchGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="20" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#matchGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} opacity="0.4" filter="url(#matchGlow)" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#matchGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-[#0a0a0f] border border-white/5 flex flex-col items-center justify-center shadow-inner">
          <span className="text-3xl font-black text-white leading-none tabular-nums">{score}%</span>
          <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase mt-1">MATCH</span>
        </div>
      </div>
    </div>
  )
}

function ScoreExplanation({ score }: { score: number }) {
    let status = { text: "Needs Improvement", color: "text-red-400", bg: "bg-red-400/10" }
    if (score >= 80) status = { text: "Excellent Match", color: "text-emerald-400", bg: "bg-emerald-400/10" }
    else if (score >= 60) status = { text: "Moderate Match", color: "text-amber-400", bg: "bg-amber-400/10" }

    return (
        <div className={`mt-6 p-4 rounded-2xl border border-white/5 space-y-2 ${status.bg} backdrop-blur-sm`}>
            <div className="flex items-center gap-2">
                <Info className={`w-4 h-4 ${status.color}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${status.color}`}>Score Meaning</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                <div className={`flex flex-col gap-1 ${score >= 80 ? "opacity-100" : "opacity-40"}`}>
                    <span className="text-emerald-400">80–100</span>
                    <span className="text-zinc-400">Excellent</span>
                </div>
                <div className={`flex flex-col gap-1 ${score >= 60 && score < 80 ? "opacity-100" : "opacity-40"}`}>
                    <span className="text-amber-400">60–79</span>
                    <span className="text-zinc-400">Moderate</span>
                </div>
                <div className={`flex flex-col gap-1 ${score < 60 ? "opacity-100" : "opacity-40"}`}>
                    <span className="text-red-400">Below 60</span>
                    <span className="text-zinc-400">Low Match</span>
                </div>
            </div>
        </div>
    )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-zinc-400 hover:text-white hover:border-primary/40 transition-all">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────

export default function JobMatcherPage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [jdText, setJdText] = useState("")
    const [isMatching, setIsMatching] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [isImproving, setIsImproving] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState<any[]>([])
    const [chatInput, setChatInput] = useState("")
    const [isChatting, setIsChatting] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    const handleMatch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!jdText && !resumeFile && !result) return

        setIsMatching(true)
        const formData = new FormData()
        if (resumeFile) formData.append("resumeFile", resumeFile)
        formData.append("jdText", jdText || result?.jobDescription || "")

        try {
            const data = await matchJob(formData)
            setResult(data.matchData)
            toast.success("Analysis complete!")
        } catch (error: any) {
            toast.error(error.message || "Failed to compare files")
        } finally {
            setIsMatching(false)
        }
    }

    const handleChat = async () => {
        if (!chatInput.trim()) return
        const newMsg = { role: "user", text: chatInput }
        setChatMessages([...chatMessages, newMsg])
        setChatInput("")
        setIsChatting(true)
        try {
            const response = await chatWithAssistant(chatInput, result)
            setChatMessages(prev => [...prev, { role: "assistant", text: response }])
        } catch (error) {
            toast.error("Assistant failed to respond")
        } finally {
            setIsChatting(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                    <Sparkles className="w-3 h-3" />
                    Role Alignment AI
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                    Job <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-violet-600">Matcher</span>
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                    Compare your skills against any job description to see how well you align. Discover exactly what's missing and how to fix it.
                </p>
            </div>

            {!result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Input Phase */}
                    <Card className="bg-[#050505]/40 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-primary/30 transition-all duration-500">
                        <div className="w-12 h-12 bg-primary/10 rounded-[1rem] flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">Your Resume</h3>
                            <p className="text-sm text-zinc-500 font-medium">Upload a custom resume for this role or we'll use your saved one.</p>
                        </div>
                        <div className="space-y-4">
                            <input type="file" id="matcher-resume-upload" className="hidden" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                            <label htmlFor="matcher-resume-upload" className="block w-full px-6 py-4 bg-[#0c0b11] border border-[#1e1b2e] rounded-2xl text-white font-bold cursor-pointer hover:border-primary/50 transition-all text-center text-sm">
                                {resumeFile ? resumeFile.name : "+ Upload New Resume"}
                            </label>
                            <p className="text-[10px] text-zinc-600 font-black uppercase text-center tracking-widest">Recommended: Tailor per JD</p>
                        </div>
                    </Card>

                    <Card className="bg-[#050505]/40 backdrop-blur-xl border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-primary/30 transition-all duration-500">
                        <div className="w-12 h-12 bg-primary/10 rounded-[1rem] flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">Job Description</h3>
                            <p className="text-sm text-zinc-500 font-medium">Paste the text of the job you're applying for here.</p>
                        </div>
                        <Textarea placeholder="Enter JD text here..." className="min-h-[120px] bg-[#0c0b11] border-[#1e1b2e] rounded-2xl focus:ring-primary/20 focus:border-primary" value={jdText} onChange={(e) => setJdText(e.target.value)} />
                    </Card>

                    <div className="md:col-span-2 flex justify-center pt-4">
                        <Button onClick={handleMatch} disabled={(!jdText && !resumeFile) || isMatching} className="h-16 px-12 gradient text-white font-black text-xl rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                            {isMatching ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" />Deep Matching...</> : "Calculate Match Score"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    
                    {/* Result Interface */}
                    <div className="space-y-12">
                        {/* Summary Block */}
                        <Card className="bg-gradient-to-br from-[#050505] to-[#0a0a0a] border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                            
                            <div className="flex justify-between items-start mb-6 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-bold text-sm">
                                    <Target className="w-4 h-4" /> match Analysis: {result.detectedRole || "Target Role"}
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="text-center md:text-left space-y-6 max-w-xl">
                                    <h2 className="text-5xl font-black text-white tracking-tight leading-[1.1]">
                                        Your profile is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{result.matchScore}%</span> match.
                                    </h2>
                                    <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                                        We've analyzed your skill overlaps for <span className="text-white font-black">{result.detectedRole}</span>. Here's your strategy to win the interview.
                                    </p>
                                </div>

                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <MatchProgressRing score={result.matchScore} />
                                    <ScoreExplanation score={result.matchScore} />
                                </div>
                            </div>
                        </Card>

                        {/* Skill Overlap Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:border-emerald-500/20 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Matching Skills</h3>
                                    </div>
                                    <HelpCircle className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.matchingSkills.map((skill: string, i: number) => (
                                        <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:border-red-400/20 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Missing Skills</h3>
                                    </div>
                                    <Button onClick={() => setIsImproving(!isImproving)} disabled={!result.bulletSuggestions?.length} variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 p-0">
                                        <Wand2 className="w-3 h-3 mr-1.5" /> Improve Resume
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingSkills.map((skill: string, i: number) => (
                                        <span key={i} className="px-4 py-2 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* AI Resume Improvement Section */}
                        {isImproving && result.bulletSuggestions && (
                            <div className="animate-in slide-in-from-top-4 fade-in duration-500">
                                <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/20 rounded-[1rem] flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight leading-none">AI Resume Enhancement</h3>
                                            <p className="text-zinc-500 font-medium mt-2">Tailoring your experience specifically for this role.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {result.bulletSuggestions.map((s: any, i: number) => (
                                            <div key={i} className="flex flex-col bg-[#050505] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all">
                                                <div className="p-5 border-b border-white/5 bg-zinc-900/40">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">Original Context</span>
                                                    <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">"{s.original}"</p>
                                                </div>
                                                <div className="p-6 space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Enhanced version</span>
                                                    </div>
                                                    <p className="text-white text-sm font-semibold leading-relaxed">"{s.improved}"</p>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <p className="text-[10px] text-zinc-500 font-medium max-w-[70%]">{s.context}</p>
                                                        <CopyButton text={s.improved} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Learning Roadmap */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Skills to Learn</h3>
                                </div>
                                <Accordion type="single" collapsible className="space-y-4">
                                    {(result.learningResources || result.skillsToLearn || []).map((resource: any, i: number) => {
                                        const skillName = typeof resource === 'string' ? resource : resource.skill
                                        return (
                                            <AccordionItem key={i} value={`skill-${i}`} className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden px-4">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex items-center gap-3 px-0">
                                                        <BookOpen className="w-4 h-4 text-purple-400" />
                                                        <span className="text-zinc-300 font-bold text-sm text-left">{skillName}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-4 space-y-4 pt-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a href={resource.youtube || `https://www.youtube.com/results?search_query=learn+${skillName}`} target="_blank" className="flex items-center justify-center gap-2 p-2 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all">
                                                            <PlayCircle className="w-3 h-3" /> YouTube
                                                        </a>
                                                        <a href={resource.docs || `https://www.google.com/search?q=${skillName}+official+documentation`} target="_blank" className="flex items-center justify-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                                                            <CheckCircle2 className="w-3 h-3" /> Docs
                                                        </a>
                                                    </div>
                                                    <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-1">
                                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Practice Project</span>
                                                        <p className="text-zinc-400 text-xs font-medium">{resource.project || `Build a small application using ${skillName} to master the core concepts.`}</p>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            </Card>

                            <Card className="lg:col-span-2 bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center">
                                            <Lightbulb className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Optimization Roadmap</h3>
                                    </div>
                                    <Button onClick={() => setResult(null)} variant="ghost" className="text-zinc-500 hover:text-white h-8 text-xs">Restart Comparison</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.alignmentSuggestions.map((suggestion: string, i: number) => (
                                        <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:shadow-xl hover:border-amber-400/20 transition-all flex gap-4">
                                            <div className="w-6 h-6 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-black text-amber-400">{i + 1}</span>
                                            </div>
                                            <p className="text-zinc-400 text-sm font-medium leading-relaxed">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* AI Career Assistant Floating Chat */}
                    <div className={`fixed bottom-8 right-8 z-50 flex flex-col items-end transition-all ${chatOpen ? "w-[380px]" : "w-16"}`}>
                        {chatOpen && (
                            <Card className="mb-4 w-full bg-[#050505]/95 backdrop-blur-2xl border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                                <CardHeader className="bg-gradient-to-r from-primary/20 to-purple-500/20 p-6 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center ring-1 ring-white/20">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black text-white">Career Assistant</CardTitle>
                                            <CardDescription className="text-xs text-zinc-400">Ask how to improve your match score</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white rounded-full">
                                        <ChevronDown className="w-5 h-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="h-[350px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                        {chatMessages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                                    <Brain className="w-6 h-6 text-zinc-600" />
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium">Hello! I'm your AI career coach. Ask me anything about this match analysis.</p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {["How to increase score?", "Which project first?", "Resume tips"].map((q, i) => (
                                                        <button key={i} onClick={() => {setChatInput(q)}} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 hover:text-white hover:bg-primary/20 transition-all">{q}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-zinc-300 rounded-bl-none'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isChatting && (
                                            <div className="flex justify-start">
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                                        <Textarea placeholder="Type your question..." className="min-h-[44px] max-h-[44px] bg-[#0a0a0f] border-white/5 rounded-2xl text-sm" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())} />
                                        <Button size="icon" onClick={handleChat} disabled={!chatInput.trim() || isChatting} className="h-[44px] w-[44px] gradient rounded-2xl shrink-0">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <Button onClick={() => setChatOpen(!chatOpen)} className={`h-16 w-16 rounded-full gradient shadow-2xl transition-all hover:scale-110 active:scale-90 ${chatOpen ? "hidden" : "flex items-center justify-center p-0"}`}>
                            <MessageSquare className="w-6 h-6" />
                        </Button>
                    </div>

                </div>
            )}
        </div>
    )
}
