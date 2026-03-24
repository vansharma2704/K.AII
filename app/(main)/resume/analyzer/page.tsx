"use client"

import { useState } from "react"
import { analyzeResume } from "@/actions/scanner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Trophy,
  Target,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  FileSearch,
  BarChart3,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

// ────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────

function ATSRing({ score }: { score: number }) {
  const r = 80
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#7c3aed" : "#f59e0b"

  return (
    <div className="w-52 h-52 relative">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* halo */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(124,58,237,0.07)" strokeWidth="20" />
        {/* track */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
        {/* glow arc */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          opacity="0.35" filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
        {/* crisp arc */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      {/* centered label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-[#0a0a0f] border border-white/5 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white leading-none tabular-nums">{score}</span>
          <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase mt-1">ATS SCORE</span>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, tooltip, color }: { label: string; value: number; tooltip: string; color: string }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{label}</span>
          <span className="hidden group-hover:block text-[10px] text-zinc-500 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 absolute mt-6 z-10 w-56">
            {tooltip}
          </span>
        </div>
        <span className="text-sm font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
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
    <button onClick={copy}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:border-primary/40 transition-all">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

// ────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showKeywordTips, setShowKeywordTips] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setIsAnalyzing(true)
    const formData = new FormData()
    // Create a fresh file object to ensure we have clear access (fixes some Windows/Browser reference issues)
    const blob = new Blob([file], { type: file.type });
    formData.append("resumeFile", blob, file.name)
    try {
      const data = await analyzeResume(formData)
      setResult(data.analysis)
      toast.success("Analysis complete!")
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze resume")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const breakdownCategories = result ? [
    { label: "Formatting", value: result.breakdown?.formatting ?? 0, color: "#a855f7", tooltip: "How well the resume layout, fonts, and structure are optimized for ATS parsers." },
    { label: "Keyword Match", value: result.breakdown?.keywords ?? 0, color: "#7c3aed", tooltip: "How many industry-specific keywords your resume contains versus what ATS expects." },
    { label: "Experience Section", value: result.breakdown?.experience ?? 0, color: "#6d28d9", tooltip: "Quality and completeness of your work experience: metrics, action verbs, and relevance." },
    { label: "Skills Match", value: result.breakdown?.skills ?? 0, color: "#4c1d95", tooltip: "Alignment between your listed skills and what the target industry demands." },
  ] : []

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl space-y-12">

      {/* ── Header ── */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px] font-black">
          <Sparkles className="w-3 h-3" /> Advanced ATS Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
          Resume <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-400 to-violet-600">Analyzer</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
          Upload your resume to get an instant ATS compatibility score, category breakdown, and AI-powered rewrite suggestions.
        </p>
      </div>

      {/* ── Upload card (pre-result) ── */}
      {!result ? (
        <Card className="max-w-lg mx-auto border-dashed border-white/10 bg-[#050505]/40 backdrop-blur-xl p-8 text-center space-y-6 rounded-[2.5rem] hover:border-primary/50 transition-all duration-500 shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center mx-auto ring-1 ring-primary/20">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-black text-white">Check Your Resume ATS Score</h2>
            <p className="text-zinc-500 text-sm font-medium">Upload your Resume (PDF or DOCX) for instant AI analysis.</p>
          </div>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-4">
              <input type="file" id="analyzer-resume-upload" className="hidden" 
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
              
              <label htmlFor="analyzer-resume-upload"
                className={`block w-full px-6 py-10 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group
                  ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-[#0c0b11] hover:border-primary/30 hover:bg-white/5'}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-all ${file ? 'bg-primary/20 scale-110' : 'bg-white/5'}`}>
                    <Upload className={`w-8 h-8 ${file ? 'text-primary' : 'text-zinc-500'}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-black text-lg">
                      {file ? file.name : "Choose File"}
                    </p>
                    <p className="text-zinc-500 text-xs font-medium">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Support for PDF and DOCX"}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            <Button type="submit" disabled={!file || isAnalyzing}
              className="w-full h-14 gradient text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Deep Scanning...</>
              ) : "Start AI Analysis"}
            </Button>
          </form>
          <div className="pt-2 flex items-center justify-center gap-6 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 italic">PDF / DOCX Only</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-2 italic">Max 5MB</span>
          </div>
        </Card>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

          {/* ── Row 1: Score Ring + Breakdown ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Score ring */}
            <Card className="lg:col-span-2 bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-6">
              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">ATS Compatibility Score</p>
              <ATSRing score={result.atsScore} />
              <p className="text-white font-black text-lg text-center">
                {result.atsScore >= 80 ? "🏆 Premium Profile" : result.atsScore >= 60 ? "✅ Solid Foundation" : "⚠️ Action Required"}
              </p>
              <p className="text-zinc-500 text-sm text-center">Your resume is {result.atsScore}% ready for enterprise ATS systems.</p>
              <Button variant="outline" onClick={() => { setResult(null); setFile(null); setShowKeywordTips(false) }}
                className="border-white/10 text-white rounded-xl hover:bg-white/5 w-full">
                Analyze Another Resume
              </Button>
            </Card>

            {/* Score breakdown */}
            <Card className="lg:col-span-3 bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">ATS Score Breakdown</h3>
                  <p className="text-xs text-zinc-500 font-medium">Category-wise analysis of your resume</p>
                </div>
              </div>
              <div className="space-y-5">
                {breakdownCategories.map((cat) => (
                  <ScoreBar key={cat.label} {...cat} />
                ))}
              </div>
              {/* Legend */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />0–50: Critical</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />51–70: Fair</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" />71–84: Good</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />85+: Excellent</span>
              </div>
            </Card>
          </div>

          {/* ── Row 2: Strengths + Weaknesses ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-4 hover:border-emerald-500/20 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((item: string, i: number) => (
                  <li key={i} className="text-zinc-400 text-sm font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-4 hover:border-red-400/20 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Weaknesses</h3>
              </div>
              <ul className="space-y-3">
                {result.weaknesses.map((item: string, i: number) => (
                  <li key={i} className="text-zinc-400 text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* ── Row 3: Missing Keywords ── */}
          <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Missing Keywords</h3>
                  <p className="text-xs text-zinc-500 font-medium">Add these to dramatically improve your ATS rank</p>
                </div>
              </div>
              <Button
                onClick={() => setShowKeywordTips(!showKeywordTips)}
                className="gradient text-white font-bold rounded-xl px-5 text-sm hover:scale-105 transition-all">
                <Wand2 className="w-4 h-4 mr-2" />
                {showKeywordTips ? "Hide Tips" : "Improve Resume with These Keywords"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.missingKeywords.map((kw: string, i: number) => (
                <span key={i} className="px-4 py-2 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-bold hover:bg-red-400/20 transition-colors cursor-default">
                  {kw}
                </span>
              ))}
            </div>
            {showKeywordTips && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Where to add these keywords →</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { section: "Skills Section", tip: "List all missing keywords that you know in your Skills or Technical Skills section." },
                    { section: "Work Experience", tip: "Naturally weave keywords into your bullet points — e.g., 'Built REST APIs using Docker and CI/CD pipelines.'" },
                    { section: "Summary / Objective", tip: "Add 2–3 key terms in your professional summary to immediately signal relevance to ATS." },
                    { section: "Project Descriptions", tip: "Mention tools and technologies (e.g., React.js, Kubernetes) in project descriptions with context." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-[#0c0b11] border border-[#1e1b2e] rounded-2xl space-y-1">
                      <p className="text-xs font-black text-primary uppercase tracking-widest">{item.section}</p>
                      <p className="text-zinc-400 text-sm font-medium">{item.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* ── Row 4: AI Improvement Suggestions ── */}
          {result.bulletSuggestions && result.bulletSuggestions.length > 0 && (
            <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-[1rem] flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">AI Suggestions</h3>
                  <p className="text-zinc-500 font-medium">AI-rewritten bullet points with stronger action verbs and quantified metrics</p>
                </div>
              </div>
              <div className="space-y-6">
                {result.bulletSuggestions.map((s: { original: string; improved: string }, i: number) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/5">
                    {/* Original */}
                    <div className="p-5 bg-[#0a0a0f] space-y-2">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Original</p>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">"{s.original}"</p>
                    </div>
                    {/* Arrow divider */}
                    <div className="flex items-center justify-center py-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                      <span className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Improved
                      </span>
                    </div>
                    {/* Improved */}
                    <div className="p-5 bg-[#0d1117] space-y-3">
                      <p className="text-white text-sm font-semibold leading-relaxed">"{s.improved}"</p>
                      <div className="flex justify-end">
                        <CopyButton text={s.improved} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Row 5: Improvement Roadmap + Skill Gaps ── */}
          <Card className="bg-[#050505]/60 border-white/5 rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-[1rem] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">AI Improvement Roadmap</h3>
                <p className="text-zinc-500 font-medium">Step-by-step guide to hit the 90+ ATS score mark.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Action Steps</h4>
                <ul className="space-y-5">
                  {result.improvementTips.map((tip: string, i: number) => (
                    <li key={i} className="relative pl-10 group">
                      <span className="absolute left-0 top-0 w-7 h-7 bg-[#0c0b11] border border-[#1e1b2e] rounded-lg flex items-center justify-center text-[10px] font-black text-white group-hover:bg-primary group-hover:border-primary transition-all">
                        {i + 1}
                      </span>
                      <p className="text-zinc-400 text-sm font-medium pt-0.5">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
                <div className="bg-[#0c0b11] border border-[#1e1b2e] rounded-3xl p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Skill Gaps to Close</h4>
                  </div>
                  <div className="space-y-4">
                    {result.skillGaps.map((gap: string, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                          <span className="text-white">{gap}</span>
                          <span className="text-primary">High Impact</span>
                        </div>
                      <Progress value={Math.floor(Math.random() * 35) + 15} className="h-1.5 bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

        </div>
      )}
    </div>
  )
}
