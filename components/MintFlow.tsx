// src/components/MintFlow.tsx
import React, { useMemo, useState } from "react";
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
  const fn =
    svc?.mintOrnament ||
    svc?.mint ||
    mod?.mintOrnament ||
    mod?.mint;

  return fn as MintFn | undefined;
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
      if (!mintFn) throw new Error("Mint function not found");

      // ✅ 여기서 실제 /api/mint 호출(=Supabase 저장)하도록 arcService가 구성돼있어야 함
const res = await mintFn(imageUrl, userAddress!, description);


      const mintId = res?.mintId || res?.id;
      if (!mintId) throw new Error("No mintId returned from mint");

      // (옵션) 서버가 newMintCount를 내려주면 반영
      const newMintCount =
        typeof res?.newMintCount === "number" ? res.newMintCount : undefined;

      onMintComplete(mintId, newMintCount);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Mint failed");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-lg mb-2">Ready to Mint</h2>
        <p className="opacity-70 text-sm mb-4">
          This will save your ornament to Supabase (wallet not required).
        </p>

        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isMinting}
          className="px-4 py-2 rounded-full border border-white/20 opacity-70 hover:opacity-100"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleMint}
          disabled={isMinting}
          className="px-4 py-2 rounded-full bg-white text-black font-medium"
        >
          {isMinting ? "Minting…" : "Mint"}
        </button>
      </div>
    </div>
  );
};

export default MintFlow;
