"use client";

import React, { useMemo, useRef, useCallback, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import CourseComposition from './course-composition';

interface SlideWithTiming {
    id: string;
    chapterId: string;
    slideIndex: number;
    slideData: any;
    startFrame: number;
    durationFrames: number;
}

export default function CoursePlayerWrapper({ slides, chapters }: { slides: any[]; chapters: { chapterId: string; title: string; slides: any[] }[] }) {
    const playerRef = useRef<PlayerRef>(null);
    const fps = 30;
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const slideTimings = useMemo(() => {
        let currentStartFrame = 0;

        return slides.map((slide) => {
            let slideDurationSecs = 5;

            if (slide.captions && Array.isArray(slide.captions) && slide.captions.length > 0) {
                const lastWord = slide.captions[slide.captions.length - 1];
                if (lastWord && lastWord.end) {
                    slideDurationSecs = lastWord.end + 1;
                }
            }

            const slideDurationFrames = Math.ceil(slideDurationSecs * fps);
            const startFrame = currentStartFrame;
            currentStartFrame += slideDurationFrames;

            return {
                ...slide,
                startFrame,
                durationFrames: slideDurationFrames
            };
        });
    }, [slides]);

    const totalDurationInFrames = useMemo(() => {
        if (slideTimings.length === 0) return 30 * 5;
        const last = slideTimings[slideTimings.length - 1];
        return last.startFrame + last.durationFrames;
    }, [slideTimings]);

    const seekToSlide = useCallback((slideId: string) => {
        const timing = slideTimings.find((s: any) => s.id === slideId);
        if (timing && playerRef.current) {
            playerRef.current.seekTo(timing.startFrame);
            playerRef.current.play();
        }
    }, [slideTimings]);

    return (
        <div className="w-full flex flex-col gap-10">
            {/* Video Player */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 -z-10" />
                <div className="w-full aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group/video">
                    <Player
                        ref={playerRef}
                        component={CourseComposition}
                        inputProps={{ slideTimings }}
                        durationInFrames={totalDurationInFrames}
                        fps={fps}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        style={{ width: '100%', height: '100%' }}
                        controls
                        autoPlay
                        loop
                        playbackRate={playbackSpeed}
                    />
                    {/* Playback Speed Control */}
                    <div className="absolute top-4 right-4 z-[99999] flex items-center gap-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-1 transition-all duration-300 opacity-0 pointer-events-none group-hover/video:opacity-100 group-hover/video:pointer-events-auto">
                        {[1, 1.5, 2].map((speed) => (
                            <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${playbackSpeed === speed
                                    ? 'bg-primary/20 text-primary shadow-[0_0_10px_-3px_var(--color-primary)]'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chapter Navigator */}
            {chapters.length > 0 && (
                <div className="w-full space-y-4">
                    <h2 className="text-xl font-bold text-white/90 tracking-tight">Chapters & Slides</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chapters.map((ch, i) => (
                            <div
                                key={ch.chapterId}
                                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all group/card"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm shrink-0 group-hover/card:shadow-[0_0_15px_-3px_var(--color-primary)] transition-shadow">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white/90 text-sm line-clamp-1">{ch.title}</h3>
                                        <p className="text-xs text-white/40 mt-1">
                                            {ch.slides.length} slide{ch.slides.length !== 1 ? 's' : ''}
                                        </p>
                                        {ch.slides.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {ch.slides.map((s: any, si: number) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => seekToSlide(s.id)}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-[10px] font-bold text-white/50 border border-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer active:scale-90"
                                                        title={`Jump to slide ${si + 1}`}
                                                    >
                                                        {si + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
