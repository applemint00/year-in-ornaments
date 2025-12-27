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

const MINTED_TEXT_DELAY_MS = 250; // Minted 텍스트 뜨는 딜레이
const MINTED_COPY_DELAY_MS = 650; // 카피(3줄) 뜨는 딜레이
const ROUTE_DELAY_MS = 2400; // Yearbook으로 넘어가는 딜레이(짧으면 스쳐 지나감)

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

  // ✅ minted 연출용 state
  const [showMintedText, setShowMintedText] = useState(false);
  const [showMintedCopy, setShowMintedCopy] = useState(false);

  // ✅ 타임아웃들 정리
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const shortAddr = (() => {
    const a = (userAddress ?? "").trim();
    if (!a) return "—";
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  })();

  const handleMint = async () => {
    // ✅ reset
    clearAllTimeouts();
    setError(null);
    setStatus("minting");

    // ✅ minted 연출 리셋
    setShowMintedText(false);
    setShowMintedCopy(false);

    try {
      if (!mintFn) throw new Error("Mint function not found");
      if (!imageUrl) throw new Error("Missing image");

      const addr = (userAddress ?? "").trim();
      if (!addr) throw new Error("Missing wallet address");

      const res = await mintFn(imageUrl, addr, description);

      const mintId: string | undefined =
        res?.mintId || res?.id || res?.data?.mintId || res?.data?.id;

      if (!mintId) throw new Error("Mint succeeded but mintId is missing");

      // ✅ minted acknowledgement
      setStatus("minted");

      // ✅ staged reveal (체크 원은 바로 / 텍스트와 카피는 딜레이)
      timeoutsRef.current.push(
        window.setTimeout(() => setShowMintedText(true), MINTED_TEXT_DELAY_MS)
      );
      timeoutsRef.current.push(
        window.setTimeout(() => setShowMintedCopy(true), MINTED_COPY_DELAY_MS)
      );

      // ✅ route after 충분히 보여주고 넘어가기
      timeoutsRef.current.push(
        window.setTimeout(() => {
          onMintComplete(mintId);
        }, ROUTE_DELAY_MS)
      );
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
          // ✅ replace wallet/price block with CENTERED minted badge + copy (bigger + delayed text)
          <div className="w-full flex flex-col items-center justify-center text-center pt-10">
            {/* big check badge */}
            <div className="w-20 h-20 rounded-full border border-gold/35 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="rgba(212,175,55,0.95)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Minted text (delayed) */}
            <div
              className={`mt-7 transition-opacity duration-300 ${
                showMintedText ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-gold/95 text-2xl font-semibold tracking-wide">
                {SUCCESS_COPY_1}
              </div>
            </div>

            {/* Copy (more delayed) */}
            <div
              className={`mt-5 space-y-2 transition-opacity duration-500 ${
                showMintedCopy ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-gold/80 text-sm">{SUCCESS_COPY_2}</div>
              <div className="text-gold/65 text-sm">{SUCCESS_COPY_3}</div>
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
          // minted state: keep CTA area clean (top already shows the animation/copy)
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
