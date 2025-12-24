// api/ornament.ts
export const config = { runtime: "nodejs" };

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// ⚠️ 경로만 네 프로젝트 구조에 맞춰 확인
import {
  ORNAMENT_BASE,
  IDENTITY_RULES,
  NEGATIVE_PROMPT,
  ORNAMENT_STYLES,
} from "../constants/stylePresets.ts";

type Body = {
  imageBase64: string; // 순수 base64 (data: prefix 없음)
  mimeType?: string;
  styleId: string;
};

function extractImageAndText(response: any) {
  let imageUrl: string | null = null;
  let description = "";

  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
    if (typeof part?.text === "string") {
      description = part.text;
    }
  }

  if (!imageUrl) throw new Error("Gemini returned no image.");

  return {
    imageUrl,
    description: (description || "A handcrafted ornament memory.")
      .slice(0, 140)
      .replace(/\n/g, " "),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // ✅ 서버 전용 키
    const apiKey =
      (process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GEMINI_API_KEY ||
        "").trim();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Missing GEMINI_API_KEY in server env",
      });
    }

    const body = (req.body || {}) as Body;
    const { imageBase64, mimeType, styleId } = body;

    if (!imageBase64 || !styleId) {
      return res.status(400).json({
        success: false,
        error: "Missing imageBase64 or styleId",
      });
    }

    const client = new GoogleGenAI({ apiKey });

    const styleKey = styleId.toLowerCase();
    const stylePrompt =
      ORNAMENT_STYLES[styleKey] || ORNAMENT_STYLES.nutcracker;

    // ✅ 옛날 프롬프트 그대로
    const finalPrompt = `
${ORNAMENT_BASE}

${IDENTITY_RULES}

[ SELECTED STYLE ]
${stylePrompt}

${NEGATIVE_PROMPT}

Output Instruction: Provide only the image.
`.trim();

    // ✅ 옛날 결과 고정: 단일 모델
    const model = "gemini-2.5-flash-image";

    const response = await client.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/png",
              data: imageBase64,
            },
          },
          { text: finalPrompt },
        ],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" },
      },
    });

    const out = extractImageAndText(response);

    return res.status(200).json({
      success: true,
      ...out,
      modelUsed: model,
    });
  } catch (err: any) {
    console.error("[api/ornament] error:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Generation failed",
    });
  }
}
