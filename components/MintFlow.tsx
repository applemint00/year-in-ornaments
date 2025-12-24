// src/components/MintFlow.tsx
import React, { useMemo, useState } from "react";

/**
 * NOTE:
 * - App.tsx에서 userAddress/description 넘기고 있어서 Props에 포함 (TS 에러 방지)
 * - arcService export 형태가 프로젝트마다 달라서 "최대한 안깨지게" 안전하게 불러오는 방식 사용
 */
import * as ArcServiceModule from "../services/arcService";

type Props = {
  imageUrl: string;
  description: string;
  userAddress?: string;
  onMintComplete: () => void;
  onBack: () => void;
};

const resolveMintFn = () => {
  const mod: any = ArcServiceModule as any;
  // 가능성: named export ArcService, default export, 혹은 함수 직접 export
  const svc = mod?.ArcService || mod?.default || mod;
  const fn = svc?.mintOrnament || svc?.mint || mod?.mintOrnament || mod?.mint;
  return fn as undefined | ((args: any) => Promise<any>);
};

const MintFlow: React.FC<Props> = ({
  imageUrl,
  description,
  userAddress,
  onMintComplete,
  onBack,
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintFn = useMemo(() => resolveMintFn(), []);

  const handleMint = async () => {
  setError(null);
  setIsMinting(true);

  try {
    // 🔕 TEMP: mint execution disabled (flow/design test)
    // WalletEntry는 통과했으므로 UX는 그대로 유지
    console.log("🧪 Mint disabled — skipping mint execution");

    onMintComplete(); // 👉 바로 트리로 이동
    return;
  } catch (e: any) {
    setError(e?.message || "Mint failed");
  } finally {
    setIsMinting(false);
  }
};


  return (
    // ✅ 오른쪽은 “블럭 카드” 느낌 제거: 배경/보더 큰 박스 없애고, 텍스트+버튼만
    <div className="w-full max-w-[440px] flex flex-col min-h-[520px] mt-10">
      {/* TOP ROW */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold/55">
            Active Wallet
          </div>
          <div className="mt-1 text-gold font-mono text-sm">
            {userAddress ? `${userAddress.slice(0, 6)}…${userAddress.slice(-4)}` : "—"}
          </div>
        </div>

        {/* ✅ ARC TESTNET -> MONAD TESTNET */}
        <div className="px-3 py-1 rounded-full border border-gold/20 text-[10px] uppercase tracking-widest text-gold/70">
          MONAD TESTNET
        </div>
      </div>

      {/* Mint price row (기존 느낌 유지, 근데 큰 박스는 제거) */}
      <div className="mt-10 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold/55">
          Mint Price
        </div>
        <div className="text-gold font-bold text-[12px] tracking-widest">FREE</div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 text-red-300 text-[11px] tracking-widest uppercase text-left">
          {error}
        </div>
      )}

      {/* BUTTONS */}
      <div className="mt-auto pt-10 flex flex-col gap-3">
        <button
          onClick={handleMint}
          disabled={isMinting}
          className="w-full py-4 rounded-full bg-gold text-burgundy font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 shadow-lg"
        >
          {isMinting ? "Minting..." : "MINT MASTERPIECE"}
        </button>

        {/* ✅ 민트 버튼 아래 “고백체 문장(=description)” 작게 + 왼쪽 라인 맞추기 */}
    

        <button
  type="button"
  onClick={onBack}
  disabled={isMinting}
  className="mt-2 text-center text-[12px] uppercase tracking-[0.35em] text-gold/45 hover:text-gold/70 transition disabled:opacity-40"
>
  CANCEL
</button>

      </div>
    </div>
  );
};

export default MintFlow;
