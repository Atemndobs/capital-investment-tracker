import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_NAME, API_KEY_STORAGE_KEY, API_KEY_WARNING } from './constants';

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null; // Stores the key used for initialization

export const initializeGeminiService = (apiKey: string | null) => {
  if (apiKey && apiKey.trim() !== "") {
    try {
      ai = new GoogleGenAI({ apiKey });
      currentApiKey = apiKey; // Store the key that was used
      console.info("Gemini AI Service initialized successfully.");
    } catch (error) {
      ai = null;
      currentApiKey = null;
      console.error("Failed to initialize Gemini AI Service with the provided key:", error);
    }
  } else {
    ai = null;
    currentApiKey = null; // Clear if no key is provided
    // console.warn(API_KEY_WARNING); // Warning is displayed in UI
  }
};

export const isGeminiAiAvailable = (): boolean => {
  return ai !== null;
};

export const getGeminiApiKeyStatus = (): { message: string, type: 'success' | 'error' | 'warning' } => {
    if (currentApiKey && ai) return { message: "Gemini API Key is set and service initialized.", type: 'success' };
    if (currentApiKey && !ai) return { message: "Gemini API Key is set, but service initialization failed. Check console.", type: 'error' };
    return { message: API_KEY_WARNING, type: 'warning' };
}

export const generateCommentSuggestion = async (amount: number, contributorName: string): Promise<string> => {
  if (!isGeminiAiAvailable() || !ai) {
    return `AI suggestions unavailable. ${getGeminiApiKeyStatus().message}`;
  }

  const prompt = `Generate a concise, positive, and contextually relevant comment for a financial contribution.
  Contributor: ${contributorName}
  Amount: $${amount.toFixed(2)}
  Comment should be suitable for an internal capital investment tracker. Avoid generic phrases like "Thank you". Focus on the nature of the investment or a positive acknowledgement.
  Examples: "Strategic capital injection.", "Funding for Q3 growth initiatives.", "Investment towards project Alpha.", "Additional capital allocation."
  
  Generated comment (1-2 short sentences):`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text.trim();
  } catch (error: any) {
    console.error("Error generating comment suggestion:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return "Could not generate suggestion: The provided Gemini API Key is invalid. Please check it in Settings.";
    }
    if (error.message && error.message.includes('Quota exceeded')) {
        return "Could not generate suggestion: Gemini API quota exceeded. Please check your Google Cloud console.";
    }
    return "Could not generate suggestion at this time. Check console for details.";
  }
};
