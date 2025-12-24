export const config = { runtime: "nodejs" };

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const clean = (addr: string) =>
  addr.trim().replace(/[\u200B-\u200D\uFEFF]/g, "").toLowerCase();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { wallet } = (req.body as any) || {};
    if (!wallet) return res.status(400).json({ message: "Missing param: wallet" });

    const addr = clean(wallet);

    // 1) 현재 카운트 읽기
    const { data, error } = await supabase
      .from("guests")
      .select("generation_count")
      .eq("wallet_address", addr)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Guest not found." });

    const current = data.generation_count ?? 0;
    const next = current + 1;

    // 2) 카운트 업데이트
    const { error: upErr } = await supabase
      .from("guests")
      .update({ generation_count: next })
      .eq("wallet_address", addr);

    if (upErr) return res.status(500).json({ message: upErr.message });

    return res.status(200).json({ newCount: next });
  } catch (e: any) {
    console.error("record-generation handler error:", e);
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}
