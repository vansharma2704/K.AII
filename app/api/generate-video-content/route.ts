import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODELS = ['gemma-3-27b-it', 'gemini-1.5-flash'];

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

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role Key for backend bypass
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY || '');

export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { courseId, chapterId, subTopics } = await req.json();

        // 1. Generate all slide JSON with Gemini (FAST — single API call)
        const prompt = `
You are a curriculum expert creating a video course chapter.

The chapter has the following subtopics:
${subTopics.join(", ")}

Create exactly 5 detailed and engaging slides.

Return STRICTLY a valid JSON array of exactly 5 objects.

Each object MUST follow this structure exactly:

{
  "slideIndex": number,
  "heading": "Clear slide heading",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "codeSnippet": "optional code or empty string",
  "narrationText": "At least 5 sentences of engaging narration"
}

Rules:
- Return ONLY JSON (no explanation, no text)
- Do NOT include markdown (no \`\`\`)
- Do NOT include comments
- Do NOT include trailing commas
- Ensure valid JSON syntax (commas between fields)
- Ensure all strings are properly quoted
- Ensure output starts with [ and ends with ]

Example format:
[
  {
    "slideIndex": 0,
    "heading": "...",
    "bulletPoints": ["...", "...", "..."],
    "codeSnippet": "",
    "narrationText": "..."
  }
]
`;


        const text = await generateWithRetry(prompt);
        let slidesJson: any[];

        try {
            const cleaned = text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            console.log("AI RAW RESPONSE:", cleaned); // debug

            slidesJson = JSON.parse(cleaned);
        } catch (err) {
            console.error("JSON PARSE ERROR:", err);
            console.error("BROKEN RESPONSE:", text);

            throw new Error("AI returned invalid JSON");
        }

        // 2. Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.some((b: any) => b.name === 'course-assets')) {
            await supabase.storage.createBucket('course-assets', { public: true, fileSizeLimit: 52428800 });
        }

        // 3. Process slides
        const generatedSlides = [];

        try {
            for (const slide of slidesJson) {
                const { slideIndex, narrationText, heading, bulletPoints, codeSnippet } = slide;

                // TTS with retry
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
                        if (!ttsRes.ok) throw new Error(`TTS Status: ${ttsRes.status}`);
                        audioBuffer = await ttsRes.arrayBuffer();
                        break;
                    } catch (e: any) {
                        if (attempt === 1) throw e;
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
                
                if (!audioBuffer) throw new Error(`TTS failed for slide ${slideIndex}`);

                // Upload to Supabase
                const audioFileName = `course-${courseId}-ch-${chapterId}-s${slideIndex}-${Date.now()}.mp3`;
                const { error: uploadError } = await supabase.storage
                    .from('course-assets')
                    .upload(audioFileName, audioBuffer, { contentType: 'audio/mpeg', cacheControl: '3600', upsert: true });
                
                if (uploadError) throw new Error(`Supabase Upload failed: ${uploadError.message}`);

                const audioUrl = supabase.storage.from('course-assets').getPublicUrl(audioFileName).data.publicUrl;

                // Captions with Deepgram
                let words: any[] = [];
                for (let capAttempt = 0; capAttempt < 2; capAttempt++) {
                    try {
                        await new Promise(r => setTimeout(r, 1000)); // Rate limit safety
                        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
                            { url: audioUrl },
                            { model: 'nova-2', smart_format: true, words: true }
                        );
                        if (!error) {
                            words = result?.results?.channels[0]?.alternatives[0]?.words || [];
                            if (words.length > 0) break;
                        }
                    } catch (e: any) {
                        console.warn(`Caption attempt ${capAttempt + 1} failed for slide ${slideIndex}:`, e?.message);
                    }
                }

                // Save to DB (Prisma)
                try {
                    const savedSlide = await db.courseSlide.create({
                        data: {
                            id: uuidv4(),
                            courseId,
                            chapterId,
                            slideIndex,
                            slideData: { heading, bulletPoints, codeSnippet },
                            narrationText,
                            audioUrl,
                            captions: words as any,
                            revealData: {}
                        }
                    });
                    generatedSlides.push(savedSlide);
                } catch (dbErr: any) {
                    console.error(`>>> [PRISMA ERROR] Failed to save slide ${slideIndex} to database:`, dbErr.message);
                    throw new Error(`Database error while saving slide ${slideIndex}: ${dbErr.message}`);
                }
            }
        } catch (err: any) {
             console.error("Critical error during slide processing:", err.message);
             throw err;
        }

        return NextResponse.json({ success: true, slides: generatedSlides });
    } catch (e: any) {
        console.error("API /generate-video-content Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
