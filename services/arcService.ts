// services/arcService.ts
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface WalletUser {
  address: string;
  balance: string;
  isConnected: boolean;
}

export type CheckResult = {
  status: "ELIGIBLE" | "COMPLETED" | "REJECTED" | "ERROR";
  message: string;
  nextAction: "STUDIO" | "TREE" | "RETRY";
  data?: {
    generation_count: number;
    mint_count: number;
    [key: string]: any;
  };
};

const ARC_CONFIG = {
  chainIdHex: "0x4CEF52",
  chainName: "Arc Testnet",
  rpcUrls: ["https://rpc.testnet.arc.network"],
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

const clean = (addr: string) =>
  addr.trim().replace(/[\u200B-\u200D\uFEFF]/g, "").toLowerCase();

const generateShortId = (input: string) => {
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return `ORN-${Math.abs(hash).toString(36).toUpperCase().slice(0, 8)}`;
};

export const ArcService = {
  connectWallet: async (): Promise<WalletUser> => {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("No wallet found. Please install Rabby or Levi wallet.");

    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CONFIG.chainIdHex }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902 || switchError.message?.includes("Unrecognized")) {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [ARC_CONFIG],
            });
          } catch {
            console.warn("User declined network addition.");
          }
        }
      }

      return { address, balance: "0", isConnected: true };
    } catch (error: any) {
      throw new Error(error.message || "Connection failed.");
    }
  },

  // ✅ READ: Supabase anon (public SELECT)
  checkEligibility: async (walletAddress: string): Promise<CheckResult> => {
    if (!isSupabaseConfigured) {
      return {
        status: "ELIGIBLE",
        message: "Simulated Access",
        nextAction: "STUDIO",
        data: { generation_count: 0, mint_count: 0 },
      };
    }

    const addr = clean(walletAddress);

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("wallet_address", addr)
      .maybeSingle(); // ✅ single() 말고 maybeSingle()

    if (error) {
      console.error("Supabase error:", error);
      return { status: "ERROR", message: "Database error.", nextAction: "RETRY" };
    }

    if (!data) {
      return { status: "REJECTED", message: "Not on guestlist.", nextAction: "RETRY" };
    }

    const gen = data.generation_count ?? 0;
    const mint = data.mint_count ?? 0;

    if (mint >= 2) {
      return {
        status: "COMPLETED",
        message: "Tree is full!",
        nextAction: "TREE",
        data: { generation_count: gen, mint_count: mint },
      };
    }

    return {
      status: "ELIGIBLE",
      message: "Welcome back.",
      nextAction: "STUDIO",
      data: { generation_count: gen, mint_count: mint },
    };
  },

  // ✅ WRITE: server function
  recordGeneration: async (walletAddress: string): Promise<number> => {
    if (!isSupabaseConfigured) return 0;

    const response = await fetch("/api/generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: clean(walletAddress) }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to record generation on server.");
    }

    return payload.newCount;
  },

  // ✅ WRITE: server function (upload + rpc + insert)
  mintOrnament: async (
    imageUrl: string,
    walletAddress: string,
    description: string
  ): Promise<{ txHash: string; publicUrl: string; newMintCount: number }> => {
    if (!isSupabaseConfigured) {
      return { txHash: "0xSIM", publicUrl: imageUrl, newMintCount: 1 };
    }

    const response = await fetch("/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageUrl,
        wallet: clean(walletAddress),
        description,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || "Minting failed on server side.");
    }

    return payload;
  },

  // ✅ READ: Supabase anon
  getMyOrnaments: async (walletAddress: string) => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("ornaments")
      .select("*")
      .eq("wallet_address", clean(walletAddress))
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: generateShortId(String(item.id)),
      url: item.image_url,
      desc: item.description,
      owner: item.wallet_address,
    }));
  },

  getGlobalOrnaments: async (limit = 60) => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from("ornaments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: generateShortId(String(item.id)),
      url: item.image_url,
      desc: item.description,
      owner: item.wallet_address,
    }));
  },
};
