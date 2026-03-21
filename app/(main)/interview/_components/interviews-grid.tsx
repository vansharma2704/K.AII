"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewReportDialog } from "./interview-report-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { deleteVoiceInterview } from "@/actions/interview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function InterviewsGrid({ 
    interviews, 
    setInterviews 
}: { 
    interviews: any[], 
    setInterviews: React.Dispatch<React.SetStateAction<any[]>> 
}) {
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleCardClick = (interview: any) => {
        setSelectedInterview(interview);
        setIsDialogOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening the dialog
        if (!window.confirm("Are you sure you want to delete this interview analysis?")) return;

        setDeletingId(id);
        try {
            await deleteVoiceInterview(id);
            toast.success("Interview deleted successfully");
            setInterviews(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            toast.error("Failed to delete interview");
        } finally {
            setDeletingId(null);
        }
    };

    // In Next.js SSR, we typically use a single pagination size to avoid hydration mismatches, 
    // or we can just default to 12 since the user wants 12 on large devices. 
    // On mobile, they will just see 3 cards before paging, but laid out 2 per row.
    const ITEMS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(interviews.length / ITEMS_PER_PAGE);

    const paginatedInterviews = interviews.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (interviews.length === 0) {
        return <p className="text-muted-foreground text-center py-12">You haven't completed any voice interviews yet.</p>;
    }

    return (
        <div className="space-y-6">
            {/* Reverted grid to 3 cols on large desktops */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedInterviews.map((interview: any) => (
                    <div key={interview.id} onClick={() => handleCardClick(interview)} className="block relative group">
                        <Card className="hover:shadow-[0_0_40px_-10px_rgba(var(--color-primary),0.15)] transition-all duration-500 cursor-pointer h-full border-white/5 hover:border-white/20 group/card bg-[#050505]/80 backdrop-blur-xl rounded-[2rem] overflow-hidden relative flex flex-col justify-between">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                            <CardHeader className="p-7 relative z-10 space-y-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2 items-center">
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 ${interview.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {interview.status}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(e, interview.id)}
                                            disabled={deletingId === interview.id}
                                            className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110"
                                        >
                                            {deletingId === interview.id ? (
                                                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                                            )}
                                        </button>
                                    </div>
                                    <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">
                                        {format(new Date(interview.createdAt), "MMM dd")}
                                    </span>
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-white group-hover/card:text-primary transition-colors line-clamp-1 mb-2">
                                        {interview.targetRole}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-sm text-white/40 font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
                                        {interview.language}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-7 pt-0 relative z-10 mt-4">
                                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Overall Score</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-black text-5xl text-white tracking-tighter drop-shadow-sm group-hover:text-primary transition-colors duration-500">
                                                {interview.technicalScore !== null && interview.communicationScore !== null && interview.confidenceScore !== null
                                                    ? Math.round((interview.technicalScore + interview.communicationScore + interview.confidenceScore) / 3)
                                                    : "--"}
                                            </span>
                                            <span className="text-white/30 font-bold">/100</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 bg-white/5 group-hover:bg-primary group-hover:text-black group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(var(--color-primary),0.4)] transition-all duration-500 group-hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${currentPage === page
                                    ? "bg-primary text-primary-foreground"
                                    : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            <InterviewReportDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                interview={selectedInterview}
            />
        </div>
    );
}
