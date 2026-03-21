"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { useRouter } from "next/navigation";

interface VoiceInterviewerProps {
    targetRole: string;
    language: string;
}

const VoiceInterviewer: React.FC<VoiceInterviewerProps> = ({ targetRole, language }) => {
    const router = useRouter();
    const vapiRef = useRef<Vapi | null>(null);

    useEffect(() => {
        if (!vapiRef.current) {
            vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");
        }
    }, []);
    const [isCalling, setIsCalling] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [activeTranscript, setActiveTranscript] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);

    const activeTranscriptRef = useRef("");
    const chatHistoryRef = useRef<{ role: string; text: string }[]>([]);
    const hasSubmittedRef = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        activeTranscriptRef.current = activeTranscript;
        chatHistoryRef.current = chatHistory;
    }, [activeTranscript, chatHistory]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isAgentSpeaking]);


    useEffect(() => {
        const onSpeechStart = () => setIsAgentSpeaking(true);
        const onSpeechEnd = () => setIsAgentSpeaking(false);

        const onMessage = (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setActiveTranscript((prev) => prev + " " + message.transcript);
                setChatHistory((prev) => {
                    // Prevent consecutive duplicate messages from the same role
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === message.role && lastMsg.text === message.transcript) {
                        return prev;
                    }
                    return [...prev, { role: message.role, text: message.transcript }];
                });
            }
        };

        const onCallEnd = async () => {
            if (hasSubmittedRef.current) return;
            hasSubmittedRef.current = true; // Prevent duplicate submissions

            setIsCalling(false);
            setIsAgentSpeaking(false);
            setLoading(true); // analyze transcript
            try {
                // Give Vapi's final transcript web-socket event a moment to flush to state
                await new Promise(resolve => setTimeout(resolve, 1000));

                const { analyzeVoiceInterview } = await import('@/actions/analyzeVoiceInterview');
                const interviewId = await analyzeVoiceInterview(
                    activeTranscriptRef.current,
                    chatHistoryRef.current,
                    targetRole,
                    language
                );
                window.location.href = '/interview';
            } catch (e) {
                console.error("Failed to submit transcript for analysis", e);
                setLoading(false);
                hasSubmittedRef.current = false; // Allow retry if failed
            }
        };

        const onError = (e: any) => {
            console.error("Vapi Error Details:", JSON.stringify(e, null, 2));
            if (e.message) console.error("Error Message:", e.message);
            setLoading(false);
            setIsCalling(false);
        };

        vapiRef.current?.on("speech-start", onSpeechStart);
        vapiRef.current?.on("speech-end", onSpeechEnd);
        vapiRef.current?.on("message", onMessage);
        vapiRef.current?.on("call-end", onCallEnd);
        vapiRef.current?.on("error", onError);

        return () => {
            vapiRef.current?.off("speech-start", onSpeechStart);
            vapiRef.current?.off("speech-end", onSpeechEnd);
            vapiRef.current?.off("message", onMessage);
            vapiRef.current?.off("call-end", onCallEnd);
            vapiRef.current?.off("error", onError);
        };
    }, [targetRole, language, router]);

    const startCall = async () => {
        setLoading(true);
        hasSubmittedRef.current = false; // Reset on new call
        try {
            const { getVapiAssistantOverrides } = await import('@/actions/vapi');
            const overrides = await getVapiAssistantOverrides(targetRole, language);

            await vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "", overrides.assistantOverrides as any);
            setIsCalling(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const endCall = () => {
        vapiRef.current?.stop();
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-[70vh] w-full max-w-4xl mx-auto relative overflow-hidden pb-12">
            {/* Top Bar - Recording & Timer */}
            {isCalling && (
                <div className="z-20 flex gap-4 mt-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#111] border border-white/10 text-white font-mono text-lg shadow-xl font-bold">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-500 text-sm tracking-widest font-sans">LIVE SESSION</span>
                        </div>
                    </div>
                </div>
            )}

            {!isCalling && (
                <div className="z-20 flex gap-4 mt-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#111] border border-white/10 text-muted-foreground text-sm font-semibold shadow-sm">
                        <span>{targetRole}</span>
                    </div>
                </div>
            )}

            {/* The Centerpiece Orb */}
            <div className={`relative flex items-center justify-center transition-all duration-700 w-full z-10 ${isCalling ? 'mt-12 mb-8' : 'my-20'}`}>
                <div className={`relative flex items-center justify-center rounded-full transition-all duration-700 ${isCalling
                    ? 'h-40 w-40 bg-[#111] border border-primary/50 shadow-[0_0_50px_-10px_var(--color-primary)] scale-100 z-10'
                    : 'h-40 w-40 bg-[#111] border border-white/10 scale-95 opacity-80'
                    }`}>

                    {isCalling && isAgentSpeaking && (
                        <>
                            {/* Outer sound waves (rings) relative to the 40x40 circle */}
                            <div className="absolute inset-[-60px] rounded-full border border-primary/20 animate-ping duration-[3000ms]" />
                            <div className="absolute inset-[-30px] rounded-full border border-primary/40 animate-ping duration-[2000ms]" />
                            <div className="absolute inset-[-10px] rounded-full ring-4 ring-primary/30 animate-pulse duration-700" />
                        </>
                    )}

                    {isCalling ? (
                        <div className={`relative z-20 flex items-center justify-center transition-all ${isAgentSpeaking ? 'scale-110 text-primary drop-shadow-[0_0_15px_var(--color-primary)]' : 'text-white/80'}`}>
                            <Mic className="h-12 w-12" />
                        </div>
                    ) : (
                        <MicOff className="relative z-20 h-12 w-12 text-muted-foreground/30" />
                    )}
                </div>
            </div>

            {/* Live Chat Overlay */}
            <div className={`w-full max-w-2xl relative z-20 transition-all duration-700 flex-1 flex flex-col justify-end ${isCalling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div ref={chatContainerRef} className="w-full flex-1 max-h-[300px] overflow-y-auto px-4 md:px-8 pb-4 flex flex-col space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent mask-image-b">
                    {chatHistory.length > 0 && chatHistory.map((msg, i) => (
                        <div key={i} className={`flex w-full flex-col ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                            {/* Role Label */}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5 ml-1">
                                {msg.role === 'assistant' ? 'AI Interviewer' : 'You'}
                            </span>

                            {/* Message Bubble */}
                            <div className={`px-6 py-4 rounded-[1.5rem] max-w-[85%] text-[15px] leading-relaxed relative ${msg.role === 'assistant'
                                ? 'bg-[#111111]/90 backdrop-blur-md text-white border border-white/5 rounded-tl-sm shadow-xl'
                                : 'bg-primary text-white shadow-[0_0_20px_-5px_var(--color-primary)] rounded-tr-sm'
                                }`}>
                                {msg.role === 'assistant' && (
                                    <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                    </div>
                                )}
                                {msg.role !== 'assistant' && (
                                    <div className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=user&backgroundColor=transparent" alt="User" className="h-full w-full object-cover" />
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isCalling && isAgentSpeaking && (
                        <div className="flex w-full items-center justify-end gap-2 text-muted-foreground text-xs italic opacity-60 mt-2">
                            <span className="flex gap-0.5">
                                <span className="h-1 w-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="h-1 w-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="h-1 w-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                            Listening...
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Control Dock */}
            <div className={`w-full max-w-sm mt-8 relative z-20 transition-all duration-700 ${isCalling ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#111111] border border-white/10 rounded-full p-2 flex items-center justify-center shadow-2xl">
                    <Button onClick={endCall} variant="destructive" className="h-12 px-10 rounded-full font-bold text-sm flex items-center gap-2 bg-red-600 hover:bg-red-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-300 w-full sm:w-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="22" x2="2" y1="2" y2="22" /></svg>
                        End Interview
                    </Button>
                </div>
            </div>

            {/* Start Button Overlay (When not calling) */}
            {!isCalling && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-transparent pointer-events-none pb-24">
                    <Button
                        onClick={startCall}
                        disabled={loading}
                        size="lg"
                        className="pointer-events-auto h-16 px-10 rounded-full font-bold text-lg bg-white/95 text-black hover:bg-white hover:scale-110 hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.8)] transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        {loading ? "Processing Interview..." : "Start Interview"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VoiceInterviewer;
