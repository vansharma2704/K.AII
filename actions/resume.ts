"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const MODELS = ["gemma-3-27b-it"];
export async function saveResume(content: any, formData?: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("No userId from auth");
      throw new Error("User not authenticated");
    }

    console.log("Authenticated user:", userId);

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId
      }
    });

    if (!user) {
      console.error("User not found in database for clerkUserId:", userId);
      throw new Error("User not found");
    }

    console.log("Found user in DB:", user.id);

    const updateData: any = {
      userId: user.id,
      content: content || ""
    };

    // Save form data as JSON string if provided
    if (formData) {
      try {
        updateData.formData = JSON.stringify(formData);
        console.log("FormData stringified, length:", updateData.formData.length);
      } catch (jsonError: any) {
        console.error("Error stringifying formData:", jsonError);
        throw new Error("Invalid form data format");
      }
    }

    console.log("Attempting upsert for userId:", user.id);
    console.log("Content length:", content?.length || 0);

    const resume = await db.resume.upsert({
      where: {
        userId: user.id
      },
      update: updateData,
      create: updateData
    })

    console.log("Resume saved successfully:", resume.id);
    revalidatePath("/resume")
    return { success: true, resume };
  } catch (error: any) {
    console.error("=== SAVE RESUME ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================");
    throw error;
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId
    }
  });

  if (!user) throw new Error("User not found");
  return await db.resume.findUnique({
    where: {
      userId: user.id
    }
  })
}

export async function improveWithAi({ current, type, organization, title }: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId
    }
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer and career coach, improve the following ${type} description${title ? ` for "${title}"` : ''}${organization ? ` at ${organization}` : ''}.
    
    Current content: "${current}"
    
    Please enhance this description by making it more impactful and professional. Focus on:
    
    **For ALL ${type} entries:**
    1. Use powerful, appropriate action verbs
    2. Include quantifiable achievements and results where possible
    3. Highlight relevant skills and competencies
    4. Focus on impact and accomplishments
    5. Use industry-appropriate language
    6. Maintain clear, professional tone
    7. Structure for readability and scannability
    
    **${type === 'experience' ? 'EXPERIENCE-SPECIFIC:' : ''}**
    ${type === 'experience' ? `
    - Emphasize professional achievements and responsibilities
    - Show business impact and value delivered
    - Highlight leadership, collaboration, and technical skills
    - Demonstrate progression and career growth
    - Include metrics (revenue, efficiency, team size, etc.)
    ` : ''}
    
    **${type === 'education' ? 'EDUCATION-SPECIFIC:' : ''}**
    ${type === 'education' ? `
    - Focus on academic achievements and relevant coursework
    - Highlight projects, research, or thesis work
    - Emphasize skills gained and knowledge applied
    - Include honors, awards, or special recognition
    - Show relevance to career goals and ${user.industry} industry
    ` : ''}
    
    **${type === 'projects' ? 'PROJECTS-SPECIFIC:' : ''}**
    ${type === 'projects' ? `
    - Detail technical implementation and challenges solved
    - Highlight technologies, frameworks, and tools used
    - Showcase problem-solving and innovation
    - Include project scope, impact, and outcomes
    - Demonstrate collaboration and project management skills
    ` : ''}
    
    ${organization ? `**Organization Context:** Consider ${organization}'s relevance and reputation in the ${user.industry} industry.` : ''}
    
    **Format Requirements:**
    - Return only the improved description text
    - Use professional, concise language
    - Maintain the original meaning while enhancing impact
    - Structure appropriately for ${type} entries
    - Avoid markdown formatting or bullet points if not in original
    
    **Important:** Only return the improved description text without any additional explanations or headers.
  `;

  let improvedContent = "";
  let error = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Implement 25s timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`AI Timeout (${modelName})`)), 25000)
      );
      
      const resultPromise = model.generateContent(prompt, { apiVersion: "v1beta" });
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;
      
      improvedContent = result.response.text().trim();
      if (improvedContent) break;
    } catch (err: any) {
      console.error(`Improvement error with model ${modelName}:`, err.message);
      error = err;
    }
  }

  if (!improvedContent) {
    throw new Error("Failed to improve content: " + (error?.message || "AI returned empty response."));
  }
  return improvedContent;
}

export async function calculateATSScore(content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  if (!content || content.trim().length < 50) {
    return { score: 0, label: "Incomplete", suggestions: ["Add more content to your resume to get an ATS score."] };
  }

  const prompt = `You are a real-world ATS (Applicant Tracking System) scoring engine used by Fortune 500 companies. Evaluate this resume the way an actual ATS + human recruiter would — with nuanced, partial-credit scoring. Consider quality, depth, and relevance, not just presence/absence.

Resume to analyze:
"""
${content}
"""

SCORING RUBRIC (100 points total). Award partial credit based on quality:

1. CONTACT_INFO (max 10):
   - Name: 0-3 pts (3=clearly formatted full name, 1=only first name, 0=missing)
   - Email: 0-3 pts (3=professional email, 1=unprofessional like coolguy@, 0=missing)
   - Phone: 0-2 pts (2=properly formatted, 1=present but poorly formatted, 0=missing)
   - LinkedIn/Portfolio: 0-2 pts (2=clickable profile link, 1=partial URL, 0=missing)

2. SUMMARY (max 15):
   - Presence & quality: 0-5 pts (5=compelling & tailored, 3=generic but present, 1=single vague line, 0=missing)
   - Industry keywords: 0-5 pts (5=rich with relevant terms, 3=some keywords, 1=very generic, 0=none)
   - Length & clarity: 0-3 pts (3=concise 2-4 sentences, 2=slightly long/short, 0=missing/rambling)
   - Specificity: 0-2 pts (2=mentions specific expertise/years, 1=vague mention, 0=nothing specific)

3. SKILLS (max 10):
   - Has skills section: 0-4 pts (4=well-organized, 2=exists but messy, 0=missing)
   - Skill count & relevance: 0-3 pts (3=5+ relevant skills, 2=3-4 skills, 1=1-2 skills, 0=none)
   - Variety: 0-3 pts (3=good mix of technical+soft, 2=mostly one type, 0=none)

4. EXPERIENCE (max 25):
   - Entries with dates: 0-8 pts (8=multiple well-structured entries, 5=1-2 entries, 2=entries without dates, 0=missing)
   - Action verbs: 0-5 pts (5=strong verbs throughout, 3=some action verbs, 1=mostly passive, 0=no descriptions)
   - Quantified results: 0-7 pts (7=metrics in most bullets, 4=some numbers, 2=vague achievements, 0=no metrics)
   - Career progression: 0-5 pts (5=clear growth shown, 3=lateral moves, 1=single position, 0=no experience)

5. EDUCATION (max 10):
   - Presence: 0-5 pts (5=complete with degree+school+year, 3=partial info, 1=just school name, 0=missing)
   - Detail: 0-5 pts (5=GPA/honors/relevant coursework, 3=basic info complete, 1=minimal, 0=missing)

6. STRUCTURE (max 15):
   - Section headings: 0-5 pts (5=clear standard headings, 3=some headings, 1=disorganized, 0=no structure)
   - Consistency: 0-5 pts (5=uniform formatting, 3=mostly consistent, 1=mixed styles, 0=chaotic)
   - Length: 0-5 pts (5=appropriate density, 3=slightly long/short, 1=way too brief, 0=nearly empty)

7. KEYWORDS (max 15):
   - Industry terms: 0-5 pts (5=strong industry language, 3=some terms, 1=very generic, 0=none)
   - Role-specific terms: 0-5 pts (5=clear role alignment, 3=partial, 1=vague, 0=none)
   - Tools & technologies: 0-5 pts (5=specific tools named, 3=some mentioned, 1=vague references, 0=none)

Score each category with partial credit based on QUALITY. Return this EXACT JSON (no markdown):
{"breakdown":{"contact":0,"summary":0,"skills":0,"experience":0,"education":0,"structure":0,"keywords":0},"score":0,"label":"","suggestions":["","",""]}

Rules:
- "score" MUST equal the exact sum of breakdown values
- Labels: 80-100="Excellent", 60-79="Good", 40-59="Needs Work", 0-39="Poor"
- 3 specific tips targeting the lowest-scoring categories
- Return ONLY the JSON`;


  let text = "";
  let error = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Implement 25s timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`AI Timeout (${modelName})`)), 25000)
      );
      
      const resultPromise = model.generateContent(prompt, { apiVersion: "v1beta" });
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;
      
      text = result.response.text().trim();
      if (text) break;
    } catch (err: any) {
      console.error(`ATS Score error with model ${modelName}:`, err.message);
      error = err;
    }
  }

  if (!text) {
    return { score: 0, label: "Error", suggestions: ["Could not calculate ATS score. " + (error?.message || "")] };
  }

  try {
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score || 0))),
      label: parsed.label || "Unknown",
      suggestions: parsed.suggestions || []
    };
  } catch (err: any) {
    console.error("ATS score parse error:", err.message);
    return { score: 0, label: "Error", suggestions: ["Could not calculate ATS score. Please try again."] };
  }
}