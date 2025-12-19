
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface WalletUser {
  address: string;
  balance: string;
  isConnected: boolean;
}

export type CheckResult = {
  status: 'ELIGIBLE' | 'COMPLETED' | 'REJECTED' | 'ERROR';
  message: string;
  nextAction: 'STUDIO' | 'TREE' | 'RETRY';
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

const base64ToBlob = async (base64Data: string): Promise<Blob> => {
  const parts = base64Data.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const clean = (addr: string) => addr.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase();

// Helper to generate a short anonymous ID from a string (like a UUID or timestamp)
const generateShortId = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return `ORN-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`;
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
          } catch (addError) {
            console.warn("User declined network addition.");
          }
        }
      }
      return { address, balance: "0", isConnected: true };
    } catch (error: any) {
      throw new Error(error.message || "Connection failed.");
    }
  },

  checkEligibility: async (walletAddress: string): Promise<CheckResult> => {
    if (!isSupabaseConfigured) {
      return { status: 'ELIGIBLE', message: "Simulated Access", nextAction: 'STUDIO', data: { generation_count: 0, mint_count: 0 } };
    }
    const addr = clean(walletAddress);
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wallet_address', addr)
      .single();

    if (error || !data) {
      return { status: 'REJECTED', message: "Not on guestlist.", nextAction: 'RETRY' };
    }
    if (data.mint_count >= 2) {
      return { status: 'COMPLETED', message: "Tree is full!", nextAction: 'TREE', data: { generation_count: data.generation_count, mint_count: data.mint_count } };
    }
    return { status: 'ELIGIBLE', message: "Welcome back.", nextAction: 'STUDIO', data: { generation_count: data.generation_count, mint_count: data.mint_count } };
  },

  recordGeneration: async (walletAddress: string): Promise<number> => {
    if (!isSupabaseConfigured) return 0;
    const { data, error } = await supabase.rpc('inc_generation', { p_wallet: clean(walletAddress) });
    if (error) throw error;
    return data;
  },

  mintOrnament: async (imageUrl: string, walletAddress: string, description: string): Promise<{ txHash: string; publicUrl: string; newMintCount: number }> => {
    if (!isSupabaseConfigured) return { txHash: "0xSIM", publicUrl: imageUrl, newMintCount: 1 };
    const addr = clean(walletAddress);
    const blob = await base64ToBlob(imageUrl);
    const fileName = `${addr}_${Date.now()}.png`;

    const { error: uploadErr } = await supabase.storage.from('ornaments').upload(fileName, blob, { contentType: 'image/png' });
    if (uploadErr) throw uploadErr;
    const { data: { publicUrl } } = supabase.storage.from('ornaments').getPublicUrl(fileName);
    const { data: newMintCount, error: rpcErr } = await supabase.rpc('inc_mint', { p_wallet: addr });
    if (rpcErr) throw rpcErr;
    const { error: insertErr } = await supabase.from('ornaments').insert({
      wallet_address: addr,
      image_url: publicUrl,
      description: description
    });
    if (insertErr) throw insertErr;
    return { txHash: "0x" + Math.random().toString(16).slice(2), publicUrl, newMintCount };
  },

  getMyOrnaments: async (walletAddress: string) => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('ornaments')
      .select('*')
      .eq('wallet_address', clean(walletAddress))
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map(item => ({ 
      id: generateShortId(item.id.toString()),
      url: item.image_url, 
      desc: item.description, 
      owner: item.wallet_address 
    }));
  },

  getGlobalOrnaments: async (limit = 60) => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('ornaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map(item => ({ 
      id: generateShortId(item.id.toString()),
      url: item.image_url, 
      desc: item.description, 
      owner: item.wallet_address 
    }));
  }
};
