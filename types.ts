
export interface StyleConfig {
  id: string;
  name: string;
  prompt: string;
  pose: string;
  icon: string;
}

export interface OrnamentState {
  originalImage: File | null;
  generatedImageUrl: string | null;
  style: string;
  isGenerating: boolean;
  isMinting: boolean;
  minted: boolean;
  description: string | null;
}

export interface GlobalOrnament {
  id: string; // The anonymous Ornament ID (e.g., short hash)
  imageUrl: string;
  description: string;
  owner: string; // Keep internal for isMine check, but hide from UI
  createdAt: string;
}

export type AppStage = 'wallet-entry' | 'intro' | 'studio' | 'mint' | 'tree';

export interface WalletState {
  address: string | null;
  balanceUSDC: number;
  isConnected: boolean;
}
