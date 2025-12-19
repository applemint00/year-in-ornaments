export const config = { runtime: "nodejs" };

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const clean = (addr: string) =>
  addr.trim().replace(/[\u200B-\u200D\uFEFF]/g, "").toLowerCase();

function dataUrlToBuffer(dataUrl: string) {
  // expects: "data:image/png;base64,....."
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image format (expected base64 data URL).");
  const mime = match[1];
  const b64 = match[2];
  const buffer = Buffer.from(b64, "base64");
  return { buffer, mime };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { image, wallet, description } = req.body || {};

    if (!image || !wallet) {
      return res.status(400).json({ message: "Missing params: image, wallet" });
    }

    const addr = clean(wallet);

    // 1) 이미지 base64 → 업로드
    const { buffer, mime } = dataUrlToBuffer(image);
    const fileName = `${addr}_${Date.now()}.png`; // png로 저장 (대부분 dataUrl이 png로 옴)

    const { error: uploadErr } = await supabase.storage
      .from("ornaments")
      .upload(fileName, buffer, {
        contentType: mime || "image/png",
        upsert: false,
      });

    if (uploadErr) {
      console.error("upload error:", uploadErr);
      return res.status(500).json({ message: uploadErr.message });
    }

    // 2) public url
    const { data: pub } = supabase.storage.from("ornaments").getPublicUrl(fileName);
    const publicUrl = pub.publicUrl;

    // 3) mint_count 증가 (RPC)
    const { data: newMintCount, error: rpcErr } = await supabase.rpc("inc_mint", {
      p_wallet: addr,
    });
    if (rpcErr) {
      console.error("inc_mint error:", rpcErr);
      return res.status(500).json({ message: rpcErr.message });
    }

    // 4) ornaments 테이블 insert
    const { error: insertErr } = await supabase.from("ornaments").insert({
      wallet_address: addr,
      image_url: publicUrl,
      description: description || null,
    });

    if (insertErr) {
      console.error("insert error:", insertErr);
      return res.status(500).json({ message: insertErr.message });
    }

    // 프론트가 기대하는 형태로 반환
    return res.status(200).json({
      txHash: "0x" + Math.random().toString(16).slice(2),
      publicUrl,
      newMintCount,
    });
  } catch (e: any) {
    console.error("mint handler error:", e);
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}
