// src/services/geminiService.ts

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string; // data:image/png;base64,....
      const [meta, b64] = result.split(",");
      const mime = meta?.match(/data:(.*);base64/)?.[1] || file.type || "image/png";
      resolve({ base64: b64, mimeType: mime });
    };
    reader.onerror = reject;
  });

export type GenResult = { imageUrl: string; description: string };

export async function generateOrnament(file: File, styleId: string): Promise<GenResult> {
  const { base64, mimeType } = await fileToBase64(file);

 const res = await fetch("/api/ornament", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
      styleId,
    }),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || !payload?.success) {
    throw new Error(payload?.error || "Generation failed");
  }

  return { imageUrl: payload.imageUrl, description: payload.description || "" };
}
