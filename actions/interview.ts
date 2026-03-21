"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({
    model: "gemma-3-27b-it"
})

// Define types for quiz data
interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizResponse {
    questions: QuizQuestion[];
}

interface QuestionResult {
    question: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
}


export async function generateQuiz() {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });

    if (!user) throw new Error("User not found");
    try {
        const prompt = `
    Generate 10 technical interview questions for a ${user.industry
            } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
            }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz = JSON.parse(cleanedText);
        return quiz.questions
    } catch (error: any) {
        console.error("Error generating quiz:", error.message)
        throw new Error("Failed to generate quiz questions")

    }

}

export async function saveQuizResult(
    questions: QuizQuestion[],
    answers: string[],
    score: number
) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });

    if (!user) throw new Error("User not found");

    // Calculate results for each question
    const questionsResults: QuestionResult[] = questions.map((q, index) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers[index],
        isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation
    }));

    // Calculate the actual score
    const correctAnswers = questionsResults.filter(q => q.isCorrect).length;
    const totalQuestions = questions.length;
    score = (correctAnswers / totalQuestions) * 100; // Percentage score

    const wrongAnswers = questionsResults.filter((q) => !q.isCorrect)
    let improvementTip = null;

    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers.map(
            (q) =>
                `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
        ).join("\n\n");

        const improvementPrompt = `
            The user got the following ${user.industry} technical interview questions wrong:

            ${wrongQuestionsText}

            Based on these mistakes, provide a concise, specific improvement tip.
            Focus on the knowledge gaps revealed by these wrong answers.
            Keep the response under 2 sentences and make it encouraging.
            Don't explicitly mention the mistakes, instead focus on what to learn/practice.
        `;

        try {
            const result = await model.generateContent(improvementPrompt)
            const response = result.response
            improvementTip = response.text().trim()
        } catch (error: any) {
            console.error("Error generating improvement tip", error.message)
            improvementTip = "Focus on reviewing key concepts in your industry to improve your performance."
        }
    } else {
        improvementTip = "Excellent performance! You answered all questions correctly."
    }

    try {
        const assessment = await db.assessment.create({
            data: {
                userId: user.id,
                quizScore: score,
                questions: JSON.parse(JSON.stringify(questionsResults)),
                category: "Technical",
                improvementTip
            }
        })
        return assessment
    } catch (error: any) {
        console.error("Error saving quiz result", error.message)
        throw new Error("Failed to save quiz result")
    }
}
export async function getAssessment() {
    const { userId } = await auth();
    if (!userId) {
        console.log("User not authenticated");
        return []; // Return empty array instead of throwing
    }

    try {
        console.log("Attempting database connection...");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        if (!user) {
            console.log("User not found in database");
            return [];
        }

        const assessments = await db.assessment.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        console.log(`Successfully fetched ${assessments.length} assessments`);
        return assessments;

    } catch (error: any) {
        console.error("Database connection failed in getAssessment:", {
            message: error.message,
            code: error.code,
            name: error.name
        });

        // Return empty array for any database connection error
        return [];
    }
}

export async function getVoiceInterviews() {
    const { userId } = await auth();
    if (!userId) return [];

    try {
        const user = await db.user.findUnique({ where: { clerkUserId: userId } });
        if (!user) return [];

        return await db.voiceInterview.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Failed to fetch voice interviews:", error);
        return [];
    }
}

export async function deleteVoiceInterview(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    try {
        const user = await db.user.findUnique({ where: { clerkUserId: userId } });
        if (!user) throw new Error("User not found");

        await db.voiceInterview.delete({
            where: {
                id,
                userId: user.id
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete voice interview:", error);
        throw new Error("Failed to delete interview");
    }
}