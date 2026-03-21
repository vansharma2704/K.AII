import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from '@deepgram/sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const wss = new WebSocketServer({ port: 8080 });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

// Interview State Management
type Stage = 'welcome' | 'introduction' | 'skills_detection' | 'technical' | 'follow_up' | 'behavioral' | 'closing';

interface Session {
    id: string;
    stage: Stage;
    skills: string[];
    history: { role: 'user' | 'model'; parts: { text: string }[] }[];
    lastAnswer?: string;
}

const sessions = new Map<string, Session>();

const STAGE_ORDER: Stage[] = ['welcome', 'introduction', 'skills_detection', 'technical', 'follow_up', 'behavioral', 'closing'];

const getSystemPrompt = (session: Session) => {
    return `
You are a STRICT professional recruiter conducting a live voice mock interview.
CURRENT STAGE: ${session.stage}
DETECTED SKILLS: ${session.skills.join(', ')}

RULES:
1. Ask exactly ONE question at a time.
2. Wait for the candidate to respond.
3. NEVER answer questions or provide feedback during the interview.
4. Keep responses extremely short and professional (max 2 sentences).
5. If the candidate is silent or unclear, ask for clarification.
6. In 'skills_detection', extract skills and confirm them.
7. In 'technical', ask deep questions about the detected skills.

Current Goal: ${getStageGoal(session.stage)}
`;
};

const getStageGoal = (stage: Stage) => {
    switch (stage) {
        case 'welcome': return "Welcome the candidate and set the stage.";
        case 'introduction': return "Ask the candidate to introduce themselves.";
        case 'skills_detection': return "Identify their core technical skills.";
        case 'technical': return "Test their technical knowledge based on detected skills.";
        case 'follow_up': return "Ask a follow-up question based on their previous technical answer.";
        case 'behavioral': return "Ask about challenges, teamwork, or problem-solving.";
        case 'closing': return "Thank them for their time and end the session.";
        default: return "";
    }
};

wss.on('connection', (ws: WebSocket) => {
    const sessionId = uuidv4();
    const session: Session = {
        id: sessionId,
        stage: 'welcome',
        skills: [],
        history: [],
    };
    sessions.set(sessionId, session);

    console.log(`New session started: ${sessionId}`);

    // Initialize Deepgram for this session
    const dgConnection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
    });

    dgConnection.on('open', () => {
        console.log(`Deepgram connected for session: ${sessionId}`);
    });

    dgConnection.on('transcript', async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && data.is_final) {
            console.log(`Transcript (${sessionId}): ${transcript}`);
            
            // 1. Skill Detection (if in early stages)
            if (session.stage === 'introduction' || session.stage === 'skills_detection') {
                const detected = await detectSkills(transcript);
                session.skills = [...new Set([...session.skills, ...detected])];
            }

            // 2. Generate AI Response via Gemini
            const chat = model.startChat({
                history: session.history,
                generationConfig: {
                    maxOutputTokens: 100,
                },
            });

            const result = await chat.sendMessage([{ text: `${getSystemPrompt(session)}\n\nCandidate response: ${transcript}` }]);
            const aiText = result.response.text();
            
            // 3. Update State & history
            session.history.push({ role: 'user', parts: [{ text: transcript }] });
            session.history.push({ role: 'model', parts: [{ text: aiText }] });

            // 4. Update Stage if necessary
            updateStage(session);

            // 5. Send to ElevenLabs TTS & back to client
            const audioData = await generateVoice(aiText);
            ws.send(JSON.stringify({ type: 'audio', data: audioData.toString('base64'), text: aiText }));
        }
    });

    ws.on('message', (message: Buffer) => {
        // Assume raw audio bytes from client
        if (dgConnection.getReadyState() === 1) {
            dgConnection.send(message);
        }
    });

    ws.on('close', () => {
        sessions.delete(sessionId);
        dgConnection.finish();
        console.log(`Session closed: ${sessionId}`);
    });
});

async function detectSkills(text: string): Promise<string[]> {
    const result = await model.generateContent([
        { text: 'Extract technical skills from the text as a comma-separated list. If none, return "none".' },
        { text: text }
    ]);
    const content = result.response.text() || "";
    if (content.toLowerCase().includes('none')) return [];
    return content.split(',').map(s => s.trim());
}

function updateStage(session: Session) {
    const currentIndex = STAGE_ORDER.indexOf(session.stage);
    if (session.history.length > (currentIndex + 1) * 2 && currentIndex < STAGE_ORDER.length - 1) {
        session.stage = STAGE_ORDER[currentIndex + 1];
    }
}

async function generateVoice(text: string): Promise<Buffer> {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; 

    const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        data: { text },
        headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
}

console.log('Vocode Interview Backend running on ws://localhost:8080');
