// src/components/MintFlow.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as ArcServiceModule from "../services/arcService";

type Props = {
  imageUrl: string;
  description: string;
  userAddress?: string;

  // App은 mintId만 쓰는 구조로 유지
  onMintComplete: (mintId: string) => void;
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
const SUCCESS_COPY_1 = "Minted.";
const SUCCESS_COPY_2 = "This memory has been sealed.";
const SUCCESS_COPY_3 = "Now, let’s begin your Year Book.";

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

  const shortAddr = (() => {
    const a = (userAddress ?? "").trim();
    if (!a) return "—";
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  })();

  const handleMint = async () => {
    setError(null);
    setStatus("minting");

    try {
      if (!mintFn) throw new Error("Mint function not found");
      if (!imageUrl) throw new Error("Missing image");

      const addr = (userAddress ?? "").trim();
      if (!addr) throw new Error("Missing wallet address");

      const res = await mintFn(imageUrl, addr, description);

      const mintId: string | undefined =
        res?.mintId || res?.id || res?.data?.mintId || res?.data?.id;

      if (!mintId) throw new Error("Mint succeeded but mintId is missing");

      // minted acknowledgement
      setStatus("minted");

      timeoutRef.current = window.setTimeout(() => {
        onMintComplete(mintId);
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setError(ERROR_COPY);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* TOP AREA */}
      <div className="space-y-10">
        {status === "minted" ? (
          // ✅ replace wallet/price block with CENTERED minted badge + copy (no extra pills)
          <div className="w-full flex flex-col items-center justify-center space-y-6 py-4">
            <div className="w-14 h-14 rounded-full border border-gold/35 flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="rgba(212,175,55,0.95)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="text-center leading-snug">
              <div className="text-[10px] uppercase tracking-[0.35em] text-gold/70">
                MINTED
              </div>
              <div className="mt-2 text-gold/90 text-sm font-medium">
                {SUCCESS_COPY_1}
              </div>
              <div className="text-gold/70 text-sm">{SUCCESS_COPY_2}</div>
              <div className="text-gold/55 text-sm">{SUCCESS_COPY_3}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.35em] text-gold/55">
                  ACTIVE WALLET
                </div>
                {/* ✅ lighter than before */}
                <div className="text-gold/85 font-medium tracking-wide">
                  {shortAddr}
                </div>
              </div>

              <div className="px-4 py-2 rounded-full border border-gold/20 text-[10px] uppercase tracking-widest text-gold/70">
                MONAD TESTNET
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.35em] text-gold/55">
                MINT PRICE
              </div>
              {/* ✅ lighter than before */}
              <div className="text-gold/80 font-medium tracking-widest">
                FREE
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA / STATUS AREA */}
      <div className="space-y-6">
        {/* error above button */}
        {status === "error" && error && (
          <div className="w-full text-center text-[12px] text-red-300">
            {error}
          </div>
        )}

        {status === "minting" ? (
          <div className="w-full flex items-center justify-center py-4 rounded-full border border-gold/25 text-gold/80 text-[12px] uppercase tracking-widest">
            MINTING…
          </div>
        ) : status === "minted" ? (
          // minted state: keep area clean (top already shows copy)
          <div className="w-full h-[52px]" />
        ) : (
          <button
            type="button"
            onClick={handleMint}
            className="w-full py-4 rounded-full bg-gold text-burgundy font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
          >
            SEAL INTO YEAR BOOK
          </button>
        )}

        {/* back to studio (text only, centered) */}
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
