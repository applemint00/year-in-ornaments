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

export const ArcService = {
  // 🔌 Wallet connect (optional autofill)
  connectWallet: async (): Promise<WalletUser> => {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error("No wallet found.");

    const accounts = await eth.request({ method: "eth_requestAccounts" });
    const address = accounts[0];

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CONFIG.chainIdHex }],
      });
    } catch {}

    return { address, balance: "0", isConnected: true };
  },

  // ✅ 핵심: INVITE 체크
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
      .maybeSingle(); // ⭐⭐⭐ 중요

    if (error) {
      console.error(error);
      return {
        status: "ERROR",
        message: "Database error",
        nextAction: "RETRY",
      };
    }

    if (!data) {
      return {
        status: "REJECTED",
        message: "Not on guestlist",
        nextAction: "RETRY",
      };
    }

    if ((data.mint_count ?? 0) >= 2) {
      return {
        status: "COMPLETED",
        message: "Tree is full",
        nextAction: "TREE",
        data: {
          generation_count: data.generation_count ?? 0,
          mint_count: data.mint_count ?? 0,
        },
      };
    }

    return {
      status: "ELIGIBLE",
      message: "Welcome back",
      nextAction: "STUDIO",
      data: {
        generation_count: data.generation_count ?? 0,
        mint_count: data.mint_count ?? 0,
      },
    };
  },
};
