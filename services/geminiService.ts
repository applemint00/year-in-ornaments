import { GoogleGenAI } from "@google/genai";
import { 
  ORNAMENT_BASE, 
  IDENTITY_RULES, 
  NEGATIVE_PROMPT, 
  ORNAMENT_STYLES 
} from "../constants/stylePresets";

// Initialize Gemini Client Lazily
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // 🛠️ FIX: Vite 환경 호환성 수정
    // process.env.API_KEY 대신 import.meta.env.VITE_GEMINI_API_KEY를 사용합니다.
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("🚨 API Key Missing: VITE_GEMINI_API_KEY not found in .env");
      throw new Error("API Key is missing. Please check your .env file.");
    }

    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Uses Gemini 2.5 Flash Image to directly transform the PFP into an ornament.
 * This ensures high fidelity to the original character's features.
 */
export const generateOrnament = async (
  file: File,
  styleId: string
): Promise<{ imageUrl: string; description: string }> => {
  try {
    const client = getAiClient();
    const base64Image = await fileToBase64(file);
    
    // Select style prompt based on ID, default to nutcracker if not found
    const stylePrompt = ORNAMENT_STYLES[styleId] || ORNAMENT_STYLES.nutcracker;

    // Construct the advanced Prompt
    const finalPrompt = `
      ${ORNAMENT_BASE}

      ${IDENTITY_RULES}

      [ SELECTED STYLE ]
      ${stylePrompt}

      ${NEGATIVE_PROMPT}
      
      Output Instruction: Provide only the image.
    `;

    console.log("🎨 Sending to Gemini 2.5 Flash Image with Style:", styleId);

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type || "image/png",
              data: base64Image
            }
          },
          { text: finalPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let generatedImageUrl = null;
    let description = `A unique ${styleId} ornament crafted from your identity.`;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Gemini returns the image as inlineData
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          // Sometimes it returns text commentary
          description = part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("Gemini completed but did not return an image.");
    }

    return {
      imageUrl: generatedImageUrl,
      description: description.slice(0, 100).replace(/\n/g, ' ')
    };

  } catch (error) {
    console.error("Error generating ornament with Gemini:", error);
    throw error;
  }
};