import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODELS = ['gemma-3-27b-it'];

async function generateWithRetry(prompt: string, maxRetries = 3): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                let text = result.response.text();
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return text;
            } catch (err: any) {
                const isRateLimit = err?.message?.includes('429') || err?.message?.includes('quota');
                console.warn(`Model ${modelName} attempt ${attempt + 1}: ${err?.message?.slice(0, 80)}`);
                if (isRateLimit) {
                    await new Promise(r => setTimeout(r, Math.min(5000 * (attempt + 1), 30000)));
                } else {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    }
    throw new Error("All models failed after retries");
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY || '');

export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { courseId, chapterId, subTopics } = await req.json();

        // 1. Generate all slide JSON with Gemini (FAST — single API call)
        const prompt = `
            You are a curriculum expert creating a video course chapter.
            The chapter has the following subtopics: ${subTopics.join(", ")}.

            Please create exactly 5 detailed, engaging slides covering these subtopics.
            You must output an array of exactly 5 JSON objects without any markdown wrappers.

            Each JSON object represents a single slide and must match this structure exactly:
            {
                "slideIndex": number,
                "heading": "Clear slide heading",
                "bulletPoints": ["point 1", "point 2", "point 3"],
                "codeSnippet": "optional relevant code or short example if applicable, otherwise empty string",
                "narrationText": "A natural, engaging voiceover script reading the points playfully to keep the viewer engaged. Minimum 5 sentences."
            }
            
            Important: You MUST return exactly 5 slides (slideIndex 0 through 4).
            Return ONLY the valid JSON array (e.g. [{...}, {...}]). Do not include \`\`\`json.
        `;

        const text = await generateWithRetry(prompt);
        const slidesJson: any[] = JSON.parse(text);

        // 2. Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.some((b: any) => b.name === 'course-assets')) {
            await supabase.storage.createBucket('course-assets', { public: true, fileSizeLimit: 52428800 });
        }

        // 3. Process slides — TTS is sequential (Deepgram connection safety), DB saves are batched
        const generatedSlides = [];

        for (const slide of slidesJson) {
            const { slideIndex, narrationText, heading, bulletPoints, codeSnippet } = slide;

            // TTS with retry (sequential — Deepgram can't handle many parallel connections)
            let audioBuffer: ArrayBuffer | null = null;
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const ttsRes = await fetchWithTimeout(
                        'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
                            },
                            body: JSON.stringify({ text: narrationText })
                        },
                        30000
                    );
                    if (!ttsRes.ok) throw new Error(`TTS ${ttsRes.status}`);
                    audioBuffer = await ttsRes.arrayBuffer();
                    break;
                } catch (e: any) {
                    if (attempt === 1) throw e;
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
            if (!audioBuffer) throw new Error(`TTS failed for slide ${slideIndex}`);

            // Upload (fast)
            const audioFileName = `course-${courseId}-ch-${chapterId}-s${slideIndex}-${Date.now()}.mp3`;
            const { error: uploadError } = await supabase.storage
                .from('course-assets')
                .upload(audioFileName, audioBuffer, { contentType: 'audio/mpeg', cacheControl: '3600', upsert: true });
            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            const audioUrl = supabase.storage.from('course-assets').getPublicUrl(audioFileName).data.publicUrl;

            // Captions with retry (sequential)
            let words: any[] = [];
            for (let capAttempt = 0; capAttempt < 2; capAttempt++) {
                try {
                    await new Promise(r => setTimeout(r, 800 + capAttempt * 800));
                    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
                        { url: audioUrl },
                        { model: 'nova-2', smart_format: true, words: true }
                    );
                    if (!error) {
                        words = result?.results?.channels[0]?.alternatives[0]?.words || [];
                        if (words.length > 0) break;
                    }
                } catch (e: any) {
                    console.warn(`Caption attempt ${capAttempt + 1} slide ${slideIndex}: ${e?.message}`);
                }
            }

            // Save to DB
            generatedSlides.push(
                await db.courseSlide.create({
                    data: {
                        id: uuidv4(), courseId, chapterId, slideIndex,
                        slideData: { heading, bulletPoints, codeSnippet },
                        narrationText, audioUrl, captions: words as any, revealData: {}
                    }
                })
            );
        }

        return NextResponse.json({ success: true, slides: generatedSlides });
    } catch (e: any) {
        console.error("API /generate-video-content Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
