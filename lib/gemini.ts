import { GoogleGenerativeAI } from "@google/generative-ai";

// Centralized list of Gemini models, ordered by preference.
// Can be overridden via the GEMINI_MODELS environment variable in .env (comma-separated list).
export const GEMINI_MODELS = process.env.GEMINI_MODELS
  ? process.env.GEMINI_MODELS.split(",").map(m => m.trim())
  : ["gemini-2.5-flash", "gemini-1.5-flash", "gemma-3-27b-it"];

// Centralized GoogleGenerativeAI client instance
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
