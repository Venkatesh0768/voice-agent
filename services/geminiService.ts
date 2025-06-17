import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { PatientData, Language } from "../src/types/types";
import { 
  GEMINI_MODEL_NAME, 
  INITIAL_SYSTEM_PROMPT_ENGLISH, 
  INITIAL_SYSTEM_PROMPT_HINDI,
  EXTRACT_DATA_PROMPT
} from "../constants";

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set for Gemini.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

interface ChatHistoryItem {
  role: "user" | "model";
  parts: Array<{text: string}>;
}

export const startChatSession = async (
  language: Language,
  initialHistory?: ChatHistoryItem[]
): Promise<Chat> => {
  const client = getAIClient();
  const systemInstruction = language === Language.HINDI ? INITIAL_SYSTEM_PROMPT_HINDI : INITIAL_SYSTEM_PROMPT_ENGLISH;
  
  const chat = client.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
    history: initialHistory || [],
  });
  return chat;
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || '';
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    // Consider more specific error handling based on Gemini error types
    throw new Error("Failed to get response from AI.");
  }
};

export const extractPatientDataFromChat = async (chatHistoryText: string): Promise<PatientData | null> => {
  const client = getAIClient();
  const prompt = EXTRACT_DATA_PROMPT.replace("{{CHAT_HISTORY}}", chatHistoryText);
  console.log("Attempting to extract patient data with prompt:", prompt);

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, 
      }
    });

    let jsonStr = (response.text || '').trim();
    console.log("Raw JSON string from Gemini for extraction:", jsonStr);

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
      console.log("JSON string after removing fences:", jsonStr);
    }
    
    const parsedJson = JSON.parse(jsonStr);
    console.log("Parsed JSON object from Gemini:", parsedJson);

    if (typeof parsedJson !== 'object' || parsedJson === null) {
      console.warn("Parsed data from Gemini is not a valid object:", parsedJson);
      return null;
    }
    
    // Check for presence of all keys as per the prompt instructions.
    // The prompt explicitly asks for null if data is missing.
    if (
      typeof parsedJson.name !== 'undefined' &&
      typeof parsedJson.age !== 'undefined' &&
      typeof parsedJson.gender !== 'undefined' &&
      typeof parsedJson.symptoms !== 'undefined' &&
      typeof parsedJson.phone !== 'undefined'
    ) {
      const extractedPatientData: PatientData = {
        name: typeof parsedJson.name === 'string' ? parsedJson.name : null,
        // Ensure age is a number or null. AI might return it as a string.
        age: (parsedJson.age !== null && !isNaN(parseFloat(parsedJson.age)) && isFinite(parsedJson.age)) ? Number(parsedJson.age) : null,
        gender: typeof parsedJson.gender === 'string' ? parsedJson.gender : null,
        symptoms: typeof parsedJson.symptoms === 'string' ? parsedJson.symptoms : null,
        phone: typeof parsedJson.phone === 'string' ? parsedJson.phone : (typeof parsedJson.phone === 'number' ? String(parsedJson.phone) : null),
      };
      console.log("Successfully extracted and structured patient data:", extractedPatientData);
      return extractedPatientData;
    } else {
      console.warn("Parsed data from Gemini does not match PatientData structure (some keys missing or undefined):", parsedJson);
      return null;
    }

  } catch (error) {
    console.error("Error extracting patient data with Gemini or parsing JSON:", error);
    return null;
  }
};
