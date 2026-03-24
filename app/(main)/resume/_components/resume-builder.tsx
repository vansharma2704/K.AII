"use client"
import { Button } from '@/components/ui/button'
import { Download, Loader2, Save, ChevronDown, ChevronRight, Eye, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resumeSchema } from '@/app/lib/schema'
import useFetch from '@/hooks/use-fetch'
import { saveResume } from '@/actions/resume'
import EntryForm from './entry-form'
import { entriesToMarkdown, certificationsToMarkdown } from '@/app/lib/helper'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import ResumePreview from './resume-preview'
import ATSScore from './ats-score'
import React, { useMemo, useCallback, memo } from 'react'

const SectionHead = memo(({ id, title, count, isOpen, num, onToggle }: { id: string; title: string; count?: number; isOpen: boolean; num: number; onToggle: (id: string) => void }) => {
    return (
        <div className="flex items-center justify-between cursor-pointer group py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-colors" onClick={() => onToggle(id)}>
            <h2 className="text-sm font-bold text-foreground/90 flex items-center gap-3 uppercase tracking-wider">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${isOpen
                    ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-[0_0_10px_-3px_var(--color-primary)]'
                    : 'bg-secondary border border-border text-muted-foreground'
                    }`}>
                    {num}
                </span>
                {title}
                {count !== undefined && count > 0 && (
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 shadow-[0_0_8px_-3px_var(--color-primary)]">{count}</span>
                )}
            </h2>
            {isOpen
                ? <ChevronDown className="w-4 h-4 text-primary transition-colors" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            }
        </div>
    );
});

SectionHead.displayName = "SectionHead";

const ResumeBuilder = ({ initialContent, initialFormData }: any) => {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [previewContent, setPreviewContent] = useState(initialContent || "")
    const [showMobilePreview, setShowMobilePreview] = useState(false)
    const { user } = useUser();

    useEffect(() => {
        document.body.style.overflow = showMobilePreview ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMobilePreview]);

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        contact: true, summary: true, skills: false, experience: true,
        education: false, projects: false, certifications: false,
        achievements: false, languages: false,
    });
    const toggleSection = useCallback((id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] })), []);

    const parsedFormData = useMemo(() => initialFormData ? JSON.parse(initialFormData) : null, [initialFormData]);
    useEffect(() => { setIsMounted(true) }, [])

    const { control, register, watch } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: parsedFormData || {
            contactInfo: { email: "", mobile: "", linkedin: "", github: "", twitter: "", leetcode: "" },
            summary: "", skills: "", experience: [], projects: [], education: [],
            certifications: [], achievements: "", languages: "",
        }
    })

    const { loading: isSaving, fn: saveResumeFn } = useFetch(saveResume)
    const formValues = watch()

    const contactMarkdown = useMemo(() => {
        const { contactInfo } = formValues || {};
        if (!contactInfo) return "";
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin) parts.push(`[LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.github) parts.push(`[GitHub](${contactInfo.github})`);
        if (contactInfo.twitter) parts.push(`[Twitter](${contactInfo.twitter})`);
        if (contactInfo.leetcode) parts.push(`[LeetCode](${contactInfo.leetcode})`);
        return parts.length > 0
            ? `<div align="center">\n\n# ${user?.fullName || 'Your Name'}\n\n${parts.join(" | ")}\n\n</div>`
            : `<div align="center">\n\n# ${user?.fullName || 'Your Name'}\n\n</div>`;
    }, [formValues.contactInfo, user?.fullName]);

    const combinedContent = useMemo(() => {
        const { summary, skills, experience, education, projects, certifications, achievements, languages } = formValues || {}
        return [
            contactMarkdown,
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            experience?.length > 0 && entriesToMarkdown({ entries: experience, type: "Work Experience" }),
            education?.length > 0 && entriesToMarkdown({ entries: education, type: "Education" }),
            projects?.length > 0 && entriesToMarkdown({ entries: projects, type: "Projects" }),
            certifications?.length > 0 && certificationsToMarkdown(certifications),
            achievements && `## Achievements & Awards\n\n${achievements}`,
            languages && `## Languages\n\n${languages}`,
        ].filter(Boolean).join("\n\n");
    }, [formValues, contactMarkdown]);

    useEffect(() => {
        setPreviewContent(combinedContent || initialContent || "")
    }, [combinedContent, initialContent])

    const onSubmit = useCallback(async () => {
        try { await saveResumeFn(combinedContent, formValues); }
        catch (error: any) { toast.error(error?.message || "Failed to save resume"); }
    }, [combinedContent, formValues, saveResumeFn]);

    const generatePDF = async () => {
        if (typeof window === 'undefined') return;
        setIsGenerating(true);
        try {
            // @ts-ignore
            const html2canvas = (await import("html2canvas")).default;
            // @ts-ignore
            const jsPDF = (await import("jspdf")).jsPDF;
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:794px;height:1123px;';
            document.body.appendChild(iframe);
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) throw new Error("Could not access iframe");
            iframeDoc.open();
            iframeDoc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                *{margin:0;padding:0;box-sizing:border-box}
                body{font-family:'Inter',sans-serif;line-height:1.5;color:#000;background:#fff;padding:50px 40px;font-size:14px}
                h1{font-size:36px;font-weight:bold;margin:0 0 8px;text-align:center;letter-spacing:-0.5px}
                h2{font-size:20px;font-weight:bold;margin:24px 0 12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #000;padding-bottom:4px}
                h3{font-size:16px;font-weight:bold;margin:16px 0 6px}
                p{margin:6px 0;line-height:1.6;font-size:14px}
                a{color:#000;text-decoration:none;font-weight:500}
                ul,ol{margin:8px 0;padding-left:20px}li{margin:3px 0;line-height:1.5;font-size:14px}
                div[align="center"]{text-align:center}
            </style></head><body><div id="resume-content"></div></body></html>`);
            iframeDoc.close();
            await new Promise(r => { iframe.onload = r; if (iframe.contentDocument?.readyState === 'complete') r(null); });
            const { marked } = await import('marked');
            let html = await marked(previewContent);
            html = html.replace(/<div align="center">/g, '<div style="text-align:center;">').replace(/(📧|📱|🔗)/g, '<span style="font-size:14px;margin-right:4px;">$1</span>');
            const el = iframeDoc.getElementById('resume-content');
            if (el) el.innerHTML = html;
            await new Promise(r => setTimeout(r, 500));
            //@ts-ignore
            const canvas = await html2canvas(iframeDoc.body, { useCORS: true, allowTaint: true, backgroundColor: '#fff', width: 794, height: 1123 });
            document.body.removeChild(iframe);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pw / canvas.width, ph / canvas.height);
            pdf.addImage(imgData, 'PNG', (pw - canvas.width * ratio) / 2, 10, canvas.width * ratio, canvas.height * ratio);
            pdf.save('resume.pdf');
            toast.success("PDF generated successfully!");
        } catch { toast.error("Failed to generate PDF."); } finally { setIsGenerating(false); }
    };

    if (!isMounted) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    let sectionCounter = 0;
    const nextNum = () => ++sectionCounter;

    const inputCls = "w-full bg-[#0f172a] border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500";

    return (
        <div className="flex w-full min-h-[calc(100vh-64px)] relative">
            {/* ═══════════════════════════════════════════════════ */}
            {/* LEFT PANEL: Editor — scrollable                     */}
            {/* ═══════════════════════════════════════════════════ */}
            <section className="w-full xl:w-5/12 flex flex-col border-r border-border bg-background xl:sticky xl:top-[64px] xl:h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="p-6 md:p-8 space-y-4 pb-32">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_-3px_var(--color-primary)] text-primary uppercase tracking-[0.2em] text-[10px] font-black">
                            ✨ AI-Powered
                        </div>
                        <h1 className="font-black text-3xl md:text-4xl tracking-tight text-white">
                            Resume <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/40">Builder</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Fill in your details. Our AI will polish the rest.</p>
                    </div>

                    {/* 1 — Contact Info */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="contact" title="Contact Information" />
                        {openSections.contact && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-5 pt-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">Email</label>
                                    <input {...register("contactInfo.email")} type="email" placeholder="your@email.com" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">Phone</label>
                                    <input {...register("contactInfo.mobile")} type="tel" placeholder="+1 234 567 8900" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">LinkedIn</label>
                                    <input {...register("contactInfo.linkedin")} type="url" placeholder="linkedin.com/in/profile" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">GitHub</label>
                                    <input {...register("contactInfo.github")} type="url" placeholder="github.com/profile" className={inputCls} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-1.5">Professional Summary</label>
                                    <Controller name='summary' control={control}
                                        render={({ field }) => <textarea {...field} rows={4} placeholder='Write a compelling professional summary...' className={`${inputCls} resize-none`} />}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2 — Experience */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="experience" title="Experience" count={formValues.experience?.length} isOpen={openSections.experience} num={nextNum()} onToggle={toggleSection} />
                        {openSections.experience && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='experience' control={control}
                                    render={({ field }) => <EntryForm type="experience" entries={field.value} onChange={field.onChange} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 3 — Education */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="education" title="Education" count={formValues.education?.length} isOpen={openSections.education} num={nextNum()} onToggle={toggleSection} />
                        {openSections.education && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='education' control={control}
                                    render={({ field }) => <EntryForm type="education" entries={field.value} onChange={field.onChange} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 4 — Skills */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="skills" title="Skills" isOpen={openSections.skills} num={nextNum()} onToggle={toggleSection} />
                        {openSections.skills && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='skills' control={control}
                                    render={({ field }) => <textarea {...field} rows={3} placeholder='List your key skills...' className={`${inputCls} resize-none`} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 5 — Projects */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="projects" title="Projects" count={formValues.projects?.length} isOpen={openSections.projects} num={nextNum()} onToggle={toggleSection} />
                        {openSections.projects && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='projects' control={control}
                                    render={({ field }) => <EntryForm type="projects" entries={field.value} onChange={field.onChange} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 6 — Certifications */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="certifications" title="Certifications" count={formValues.certifications?.length} isOpen={openSections.certifications} num={nextNum()} onToggle={toggleSection} />
                        {openSections.certifications && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='certifications' control={control}
                                    render={({ field }) => <CertificationForm entries={field.value || []} onChange={field.onChange} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 7 — Achievements */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="achievements" title="Achievements & Awards" isOpen={openSections.achievements} num={nextNum()} onToggle={toggleSection} />
                        {openSections.achievements && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='achievements' control={control}
                                    render={({ field }) => <textarea {...field} rows={3} placeholder="Dean's List, Hackathon Winner..." className={`${inputCls} resize-none`} />}
                                />
                            </div>
                        )}
                    </div>

                    {/* 8 — Languages */}
                    <div className="rounded-2xl border border-border/60 bg-white/[0.02] p-1">
                        <SectionHead id="languages" title="Languages" isOpen={openSections.languages} num={nextNum()} onToggle={toggleSection} />
                        {openSections.languages && (
                            <div className="px-4 pb-5 pt-2">
                                <Controller name='languages' control={control}
                                    render={({ field }) => <textarea {...field} rows={2} placeholder="English (Native), Hindi (Fluent)..." className={`${inputCls} resize-none`} />}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile bottom bar */}
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border xl:hidden z-10">
                    <div className="flex gap-2">
                        <Button onClick={() => setShowMobilePreview(true)} variant="outline" className="flex-1 border-primary/30 text-primary font-bold">
                            <Eye className='h-4 w-4' /> Preview
                        </Button>
                        <Button onClick={onSubmit} disabled={isSaving} variant="outline" className="flex-1 border-border font-bold">
                            {isSaving ? <><Loader2 className='h-4 w-4 animate-spin' /> Saving...</> : 'Save Draft'}
                        </Button>
                    </div>
                </div>

                {/* Mobile preview overlay */}
                {showMobilePreview && (
                    <div className="fixed inset-0 z-50 bg-background xl:hidden flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md">
                            <h2 className="font-bold text-foreground">Resume Preview</h2>
                            <div className="flex items-center gap-3">
                                <ATSScore content={previewContent} />
                                <button onClick={() => setShowMobilePreview(false)} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 bg-secondary flex justify-center">
                            <ResumePreview content={previewContent} />
                        </div>
                        <div className="p-4 border-t border-border bg-background">
                            <Button onClick={() => { setShowMobilePreview(false); generatePDF(); }} disabled={isGenerating} className="w-full gradient text-primary-foreground font-bold">
                                {isGenerating ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating...</> : <><Download className='h-4 w-4' /> Download PDF</>}
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* RIGHT PANEL: Preview — fixed with dark bg           */}
            {/* ═══════════════════════════════════════════════════ */}
            <section className="hidden xl:flex flex-1 bg-secondary flex-col relative">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
                {/* Floating ATS Widget */}
                <div className="sticky top-[68px] self-end mr-6 z-10">
                    <ATSScore content={previewContent} />
                </div>

                {/* Paper area */}
                <div className="flex-1 w-full flex justify-center px-4 -mt-4">
                    <ResumePreview content={previewContent} />
                </div>

                {/* Action Bar — sits at the bottom, user scrolls to it */}
                <div className="w-full flex justify-center py-8 px-4">
                    <div className="flex items-center gap-2 purple-border-gradient p-2 rounded-xl shadow-2xl shadow-black/50 bg-secondary/80 backdrop-blur-md">
                        <button onClick={onSubmit} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <div className="w-px h-6 bg-border" />
                        <Button onClick={generatePDF} disabled={isGenerating} className="gradient text-primary-foreground font-bold px-6 text-sm shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                            {isGenerating ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating...</> : <><Download className='h-4 w-4' /> Download PDF</>}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

// ━━━ Certification Sub-form ━━━
function CertificationForm({ entries, onChange }: { entries: any[]; onChange: (v: any[]) => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState(""); const [organization, setOrganization] = useState("");
    const [date, setDate] = useState(""); const [credentialId, setCredentialId] = useState("");
    const inputCls = "w-full bg-[#0f172a] border-[#334155] rounded-xl px-4 py-2 text-sm text-white placeholder:text-muted-foreground/50 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500";

    const handleAdd = () => {
        if (!name.trim() || !organization.trim()) return;
        onChange([...entries, { name, organization, date, credentialId }]);
        setName(""); setOrganization(""); setDate(""); setCredentialId(""); setIsAdding(false);
    };

    return (
        <div className="space-y-2">
            {entries.map((cert, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border group">
                    <div>
                        <p className="text-sm font-bold text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.organization}{cert.date ? ` • ${cert.date}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => onChange(entries.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
            ))}
            {isAdding ? (
                <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="grid grid-cols-2 gap-2">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Certification name" className={inputCls} />
                        <input value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Issuing organization" className={inputCls} />
                        <input value={date} onChange={e => setDate(e.target.value)} placeholder="Date (e.g. Jan 2024)" className={inputCls} />
                        <input value={credentialId} onChange={e => setCredentialId(e.target.value)} placeholder="Credential ID (optional)" className={inputCls} />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">Cancel</button>
                        <button type="button" onClick={handleAdd} className="text-xs gradient text-primary-foreground font-bold px-4 py-1.5 rounded-lg">Add</button>
                    </div>
                </div>
            ) : (
                <button type="button" onClick={() => setIsAdding(true)} className="w-full text-xs border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/30 rounded-xl py-2.5 transition-colors">
                    + Add Certification
                </button>
            )}
        </div>
    );
}

export default ResumeBuilder
