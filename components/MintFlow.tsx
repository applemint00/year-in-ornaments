
import React, { useState } from 'react';
import { Wallet, CheckCircle, Loader2, Coins, ArrowRight, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { MOCK_ARC_GAS_FEE } from '../constants';
import { ArcService, WalletUser } from '../services/arcService';

interface Props {
  imageUrl: string;
  description: string;
  userAddress?: string;
  onMintComplete: (newMintCount?: number) => void;
  onBack: () => void;
}

const MintFlow: React.FC<Props> = ({ imageUrl, description, userAddress, onMintComplete, onBack }) => {
  const [step, setStep] = useState<'connect' | 'confirm' | 'minting' | 'success'>('connect');
  const [walletUser, setWalletUser] = useState<WalletUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMismatch, setIsMismatch] = useState(false);
  const [lastMintCount, setLastMintCount] = useState<number | undefined>(undefined);
  
  const handleConnect = async () => {
    try {
      setErrorMessage(null);
      setIsMismatch(false);
      const user = await ArcService.connectWallet();
      
      if (userAddress && user.address.toLowerCase() !== userAddress.toLowerCase()) {
        setIsMismatch(true);
        setWalletUser(user);
        throw new Error("Different wallet detected.");
      }
      
      setWalletUser(user);
      setStep('confirm');
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to connect wallet.");
    }
  };

  const handleMint = async () => {
    if (!walletUser?.address) return;
    setStep('minting');
    setErrorMessage(null);

    try {
      const result = await ArcService.mintOrnament(imageUrl, walletUser.address, description);
      localStorage.setItem("last_wallet_address", walletUser.address.trim().toLowerCase());
      const fresh = await ArcService.checkEligibility(walletUser.address);
      setLastMintCount(typeof fresh.data?.mint_count === 'number' ? fresh.data.mint_count : result.newMintCount);
      setStep('success');
    } catch (error: any) {
      setErrorMessage(error.message || "Transaction failed.");
      setStep('confirm');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Monad_Ornament_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start text-center relative z-20 animate-fade-in-up">
      {step === 'connect' && (
        <div className="w-full bg-black/40 p-10 rounded-3xl border border-gold/30 backdrop-blur-md shadow-2xl flex flex-col items-center gap-8 animate-fade-in">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Wallet className="text-gold w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif text-gold drop-shadow-md">Confirm Identity</h2>
            <p className="text-softGold/60 text-[10px] uppercase tracking-widest leading-relaxed">
              Connect the verified wallet:
              <br/>
              <span className="text-gold font-mono text-xs mt-2 block lowercase">
                {userAddress ? `${userAddress.slice(0, 8)}...${userAddress.slice(-6)}` : "Guest Wallet"}
              </span>
            </p>
          </div>

          {errorMessage && (
            <div className={`w-full border rounded-xl p-5 flex flex-col gap-3 text-left animate-fade-in ${isMismatch ? 'bg-amber-900/30 border-amber-500/50' : 'bg-red-900/40 border-red-500/40'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={isMismatch ? 'text-amber-400' : 'text-red-400'} size={20} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isMismatch ? 'text-amber-200' : 'text-red-200'}`}>
                  {isMismatch ? "Different Wallet Detected" : "Connection Error"}
                </span>
              </div>
              
              {isMismatch && walletUser && (
                <div className="space-y-2">
                  <p className="text-[10px] text-amber-100/60 leading-tight">
                    You're currently connected as <span className="text-amber-300 font-mono">{walletUser.address.slice(0, 6)}...{walletUser.address.slice(-4)}</span>. 
                    Please switch to the invited wallet above.
                  </p>
                </div>
              )}
              
              {!isMismatch && <p className="text-[10px] text-red-200/70">{errorMessage}</p>}
            </div>
          )}

          <button onClick={handleConnect} className="w-full bg-gold hover:bg-white text-night font-bold py-4 rounded-full shadow-lg transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
            {isMismatch ? <RefreshCw size={18} /> : null}
            {isMismatch ? "Switch & Connect" : "Connect Wallet"}
          </button>
          <button onClick={onBack} className="text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Back to Studio</button>
        </div>
      )}

      {step === 'confirm' && walletUser && (
        <div className="w-full bg-black/40 p-6 md:p-8 rounded-3xl border border-gold/30 backdrop-blur-md shadow-2xl space-y-5 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-softGold/70 uppercase tracking-widest text-[9px]">Active Wallet</span>
            <span className="font-mono text-gold text-[10px] bg-gold/10 px-3 py-1 rounded-full border border-gold/20">{walletUser.address.slice(0, 6)}...{walletUser.address.slice(-4)}</span>
          </div>
          
          <div className="aspect-square w-44 md:w-48 mx-auto rounded-2xl overflow-hidden border-2 border-gold shadow-2xl relative group">
            <img src={imageUrl} alt="To Mint" className="w-full h-full object-cover" />
            <button 
              onClick={handleDownload}
              className="absolute top-2 right-2 p-2.5 bg-black/70 rounded-full border border-[#d4af37]/40 text-[#d4af37] shadow-lg transition-all active:scale-90 flex items-center justify-center z-50 hover:bg-[#d4af37] hover:text-black"
              title="Save Preview"
            >
              <Download size={16} />
            </button>
          </div>

          <div className="bg-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest">
              <span className="text-white/60">Network</span>
              <span className="text-white font-bold tracking-tight">Arc Testnet</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest border-t border-white/5 pt-2">
              <span className="text-white/60">Mint Price</span>
              <span className="text-gold font-mono flex items-center gap-1 font-bold">FREE</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button onClick={handleMint} className="w-full bg-gold hover:bg-white text-night font-bold py-4 rounded-full shadow-lg uppercase tracking-widest text-sm transition-transform active:scale-95">Mint Masterpiece</button>
            <button onClick={onBack} className="w-full border border-white/10 text-white/40 hover:text-white py-2 rounded-full font-medium uppercase tracking-widest text-[10px] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {step === 'minting' && (
        <div className="space-y-6 text-center py-20 animate-fade-in">
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto" />
          <h2 className="text-2xl font-serif text-white tracking-widest italic">Minting NFT...</h2>
        </div>
      )}

      {step === 'success' && (
        <div className="w-full bg-black/40 p-10 rounded-3xl border border-green-500/30 backdrop-blur-md shadow-2xl text-center space-y-8 animate-fade-in">
          <CheckCircle className="text-green-500 w-16 h-16 mx-auto drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white italic">Success!</h2>
            <p className="text-softGold/50 text-[10px] uppercase tracking-widest">Your ornament is now on the global tree.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button onClick={() => onMintComplete(lastMintCount)} className="w-full bg-gold hover:bg-white text-night font-bold py-5 rounded-full flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl group transition-all">
              Enter Global Tree <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintFlow;
