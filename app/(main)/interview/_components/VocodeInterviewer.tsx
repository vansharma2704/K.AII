"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VocodeInterviewerProps {
    targetRole: string;
    language: string;
}

const VocodeInterviewer: React.FC<VocodeInterviewerProps> = ({ targetRole, language }) => {
    const [isCalling, setIsCalling] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        };
    }, []);

    const startInterview = async () => {
        setLoading(true);
        try {
            // 1. Initialize WebSocket
            const ws = new WebSocket("ws://localhost:8080");
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("Connected to Vocode backend");
                setIsCalling(true);
                setLoading(false);
                startRecording();
            };

            ws.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'audio') {
                    // Queue audio for sequence playback
                    audioQueueRef.current.push(message.data);
                    if (!isPlayingRef.current) {
                        playNextInQueue();
                    }
                }
                if (message.text) {
                    setTranscript(prev => [...prev, `AI: ${message.text}`]);
                }
            };

            ws.onerror = (err) => console.error("WS Error:", err);
            ws.onclose = () => setIsCalling(false);

        } catch (e) {
            console.error("Failed to start interview:", e);
            setLoading(false);
        }
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(event.data);
            }
        };

        mediaRecorder.start(250); // Send chunks every 250ms
    };

    const playNextInQueue = async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            setIsAgentSpeaking(false);
            return;
        }

        isPlayingRef.current = true;
        setIsAgentSpeaking(true);
        const base64Audio = audioQueueRef.current.shift()!;
        const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
        
        const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);

        audio.onended = () => {
            playNextInQueue();
        };

        await audio.play();
    };

    const stopInterview = () => {
        if (wsRef.current) wsRef.current.close();
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        setIsCalling(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto p-8 relative">
            {/* Header / Meta */}
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                    <Sparkles className="w-4 h-4" />
                    Real-time Voice Engine
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">AI Voice Interview</h2>
            </div>

            {/* The Visualizer / Orb */}
            <div className="relative mb-16">
                <motion.div 
                    animate={{
                        scale: isAgentSpeaking ? [1, 1.2, 1] : 1,
                        boxShadow: isAgentSpeaking 
                            ? ["0 0 20px rgba(168,85,247,0.2)", "0 0 60px rgba(168,85,247,0.5)", "0 0 20px rgba(168,85,247,0.2)"]
                            : "0 0 20px rgba(255,255,255,0.05)"
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`w-48 h-48 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                        isCalling ? 'bg-[#0a0a0a] border-primary/50' : 'bg-white/5 border-white/10'
                    }`}
                >
                    {isCalling ? (
                        <div className="relative">
                            <Mic className={`w-12 h-12 transition-all ${isAgentSpeaking ? 'text-primary scale-110' : 'text-white/40'}`} />
                            {isAgentSpeaking && (
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                            )}
                        </div>
                    ) : (
                        <MicOff className="w-12 h-12 text-white/10" />
                    )}
                </motion.div>
                
                {/* Wave Rings */}
                <AnimatePresence>
                    {isAgentSpeaking && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 0.4, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-full border border-primary/30" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 0.2, scale: 2 }}
                                exit={{ opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                                className="absolute inset-0 rounded-full border border-primary/20" 
                            />
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                {!isCalling ? (
                    <Button 
                        onClick={startInterview} 
                        disabled={loading}
                        className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black text-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Start InterviewSession"}
                    </Button>
                ) : (
                    <Button 
                        onClick={stopInterview}
                        variant="destructive"
                        className="w-full h-16 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:scale-105 transition-all"
                    >
                        End InterviewSession
                    </Button>
                )}
            </div>

            {/* Transcription Feed */}
            <div className="mt-12 w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[150px] max-h-[300px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
                    <div className={`w-2 h-2 rounded-full ${isCalling ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`} />
                    Live Transcript
                </div>
                <div className="space-y-4">
                    {transcript.length === 0 ? (
                        <p className="text-white/20 italic">Interview transcript will appear here...</p>
                    ) : (
                        transcript.map((line, i) => (
                            <motion.p 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-sm ${line.startsWith('AI:') ? 'text-primary font-bold' : 'text-white/70'}`}
                            >
                                {line}
                            </motion.p>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VocodeInterviewer;
