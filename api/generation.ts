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
    if (!wallet) return res.status(400).json({ message: "Missing wallet" });

    const { data, error } = await supabase.rpc("inc_generation", {
      p_wallet: clean(wallet),
    });

    if (error) {
      console.error("inc_generation error:", error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ newCount: data });
  } catch (e: any) {
    console.error("generation handler error:", e);
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}