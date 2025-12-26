// src/components/MintFlow.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as ArcServiceModule from "../services/arcService";

type Props = {
  imageUrl: string;
  description: string;
  userAddress?: string;

  // ✅ mintId를 App으로 올려보내서 Yearbook 라우팅에 쓰는 구조
  onMintComplete: (mintId: string, newMintCount?: number) => void;

  onBack: () => void;
};

type MintFn = (
  imageUrl: string,
  walletAddress: string,
  description: string
) => Promise<any>;

const resolveMintFn = (): MintFn | undefined => {
  const mod: any = ArcServiceModule as any;
  const svc = mod?.ArcService || mod?.default || mod;
  const fn = svc?.mintOrnament || svc?.mint || mod?.mintOrnament || mod?.mint;
  return fn as MintFn | undefined;
};

type UiStatus = "idle" | "minting" | "minted" | "error";

const ERROR_COPY = "Transaction failed. Please try again.";
const SUCCESS_COPY_1 = "This memory has been sealed.";
const SUCCESS_COPY_2 = "Now, let’s begin your Year Book.";

const MintFlow: React.FC<Props> = ({
  imageUrl,
  description,
  userAddress,
  onMintComplete,
  onBack,
}) => {
  const mintFn = useMemo(() => resolveMintFn(), []);
  const [status, setStatus] = useState<UiStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMint = async () => {
    // retry clears error
    setError(null);
    setStatus("minting");

    try {
      if (!mintFn) throw new Error("Mint function not found");
      if (!imageUrl) throw new Error("Missing image");

      const addr = (userAddress ?? "").trim();
      if (!addr) throw new Error("Missing wallet address");

      const res = await mintFn(imageUrl, addr, description);

      // tolerate common response shapes
      const mintId: string | undefined =
        res?.mintId || res?.id || res?.data?.mintId || res?.data?.id;
      const newMintCount: number | undefined =
        res?.newMintCount || res?.mintCount || res?.data?.newMintCount;

      if (!mintId) throw new Error("Mint succeeded but mintId is missing");

      // ✅ show minted acknowledgement first
      setStatus("minted");

      timeoutRef.current = window.setTimeout(() => {
        onMintComplete(mintId, newMintCount);
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setError(ERROR_COPY);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* top area (keep your existing design language) */}
      <div className="space-y-10">
        <div className="w-full flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.35em] text-gold/60">
              ACTIVE WALLET
            </div>
            <div className="text-gold font-semibold tracking-wide">
              {(() => {
                const a = (userAddress ?? "").trim();
                if (!a) return "—";
                return `${a.slice(0, 6)}...${a.slice(-4)}`;
              })()}
            </div>
          </div>

          <div className="px-4 py-2 rounded-full border border-gold/25 text-[10px] uppercase tracking-widest text-gold/80">
            MONAD TESTNET
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold/60">
            MINT PRICE
          </div>
          <div className="text-gold font-bold tracking-widest">FREE</div>
        </div>
      </div>

      {/* CTA / status area */}
      <div className="space-y-6">
        {/* Error copy ABOVE the button */}
        {status === "error" && error && (
          <div className="w-full text-center text-[12px] text-red-300">
            {error}
          </div>
        )}

        {status === "minted" ? (
          <div className="w-full text-left">
            <div className="text-gold/90 text-sm font-medium">
              {SUCCESS_COPY_1}
            </div>
            <div className="text-gold/60 text-sm mt-1">{SUCCESS_COPY_2}</div>
          </div>
        ) : status === "minting" ? (
          <div className="w-full flex items-center justify-center py-4 rounded-full border border-gold/25 text-gold/80 text-[12px] uppercase tracking-widest">
            MINTING…
          </div>
        ) : (
          <button
            type="button"
            onClick={handleMint}
            className="w-full py-4 rounded-full bg-gold text-burgundy font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
          >
            SEAL INTO YEAR BOOK
          </button>
        )}

        {/* back (text only, centered, small) */}
        {status !== "minted" && (
          <div
            onClick={status === "minting" ? undefined : onBack}
            className={`w-full text-center text-[10px] tracking-[0.35em] text-gold/50 transition ${
              status === "minting"
                ? "opacity-30 cursor-not-allowed"
                : "hover:text-gold/80 cursor-pointer"
            }`}
          >
            Back to studio
          </div>
        )}
      </div>
    </div>
  );
};

export default MintFlow;
