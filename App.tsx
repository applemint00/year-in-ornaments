import React, { useEffect, useState } from "react";
import IntroSequence from "./components/IntroSequence";
import WalletEntry from "./components/WalletEntry";
import MintFlow from "./components/MintFlow";
import Tree3D from "./components/Tree3D";
import MemoryCard from "./components/MemoryCard";
import { generateOrnament } from "./services/geminiService";
import { ArcService } from "./services/arcService";
import { STYLE_OPTIONS } from "./constants";
import { AppStage, OrnamentState } from "./types";
import { Plus, Sparkles, TreePine, Zap } from "lucide-react";

const MAX_GENERATIONS = 4;
const MAX_MINTS = 2;

const WISH_MAX = 84;
const WISH_POOL = [
  "May your spirit rise on wings of hope this new year.",
  "May your work be seen, and your rest be protected.",
  "May you find quiet wins that change everything.",
  "May your next chapter feel lighter, bolder, and more yours.",
  "May you meet the right people at the right time.",
  "May your 2025 be steady, warm, and weirdly lucky.",
];

const pickWish = (exclude?: string | null) => {
  const pool = exclude ? WISH_POOL.filter((w) => w !== exclude) : WISH_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
};

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>("wallet-entry");
  const [error, setError] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    localStorage.getItem("last_wallet_address")
  );
  const [counts, setCounts] = useState({ gen: 0, mint: 0 });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [treeRefreshKey, setTreeRefreshKey] = useState(0);

  const [wish, setWish] = useState<string>(() => pickWish());

  const [ornamentState, setOrnamentState] = useState<OrnamentState>({
    originalImage: null,
    generatedImageUrl: null,
    style: STYLE_OPTIONS[0].id,
    isGenerating: false,
    isMinting: false,
    minted: false,
    description: null,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // session recovery
  useEffect(() => {
    const boot = async () => {
      const saved = localStorage.getItem("last_wallet_address");
      if (!saved) return;
      const addr = saved.trim().toLowerCase();
      setWalletAddress(addr);
      try {
        const res = await ArcService.checkEligibility(addr);
        if (res.status === "ELIGIBLE" || res.status === "COMPLETED") {
          setCounts({
            gen: res.data?.generation_count || 0,
            mint: res.data?.mint_count || 0,
          });
        }
      } catch (err) {
        console.error("Session recovery failed:", err);
      }
    };
    boot();
  }, []);

  const handleWalletEntryComplete = (
    address: string,
    userCounts: { gen: number; mint: number }
  ) => {
    const cleanAddress = address.toLowerCase().trim();
    setWalletAddress(cleanAddress);
    setCounts(userCounts);
    localStorage.setItem("last_wallet_address", cleanAddress);
    setStage("intro");
  };

  const handleSkipToTree = () => {
    const saved = localStorage.getItem("last_wallet_address");
    if (saved) setWalletAddress(saved.toLowerCase().trim());
    setStage("yearbook");
  };

  const handleIntroComplete = () => setStage("studio");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      setOrnamentState((prev) => ({
        ...prev,
        originalImage: file,
        generatedImageUrl: null,
      }));

      setWish(pickWish());
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!walletAddress) {
      setStage("wallet-entry");
      return;
    }
    if (!ornamentState.originalImage) return;
    if (counts.gen >= MAX_GENERATIONS) {
      setError("Daily limit reached (4/4).");
      return;
    }

    setOrnamentState((prev) => ({ ...prev, isGenerating: true }));
    setError(null);

    try {
      const result = await generateOrnament(
        ornamentState.originalImage,
        ornamentState.style
      );

      await ArcService.recordGeneration(walletAddress);
      setCounts((prev) => ({ ...prev, gen: prev.gen + 1 }));

      setOrnamentState((prev) => ({
        ...prev,
        generatedImageUrl: result.imageUrl,
        description: result.description,
        isGenerating: false,
      }));

      setWish(pickWish());
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to craft. Please try again.");
      setOrnamentState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleMintComplete = (newMintCount?: number) => {
    if (typeof newMintCount === "number") {
      setCounts((prev) => ({ ...prev, mint: newMintCount }));
    } else {
      setCounts((prev) => ({ ...prev, mint: prev.mint + 1 }));
    }
    setTreeRefreshKey((k) => k + 1);
    setStage("yearbook");
  };

  if (stage === "wallet-entry")
    return (
      <WalletEntry onComplete={handleWalletEntryComplete} onSkip={handleSkipToTree} />
    );
  if (stage === "intro") return <IntroSequence onComplete={handleIntroComplete} />;
if (stage === "yearbook")
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#FFDFA6] flex items-center justify-center">
      <div className="text-center">
        <div className="font-serif text-4xl tracking-wide">Year Book</div>

        {ornamentState.generatedImageUrl ? (
          <img
            src={ornamentState.generatedImageUrl}
            alt="Ornament"
            className="mt-6 w-[320px] max-w-[80vw] rounded-xl border border-[#FFDFA6]/20 shadow"
          />
        ) : (
          <div className="mt-6 opacity-70">No ornament image.</div>
        )}

        <button
          className="mt-8 px-6 py-2 rounded-full border border-[#FFDFA6]/30 hover:bg-[#FFDFA6]/10 transition"
          onClick={() => setStage("studio")}
        >
          Back to Studio
        </button>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col text-softGold font-sans bg-burgundy">
      <header className="w-full flex flex-col items-center text-center pt-20 pb-12 px-6 mb-14">
        <h1 className="text-5xl md:text-6xl italic leading-tight text-gold font-serif drop-shadow-lg">
          Year in Ornaments
        </h1>
        <p className="mt-4 text-sm opacity-70 max-w-lg font-light tracking-widest">
          Preserve your 2025 self as a quiet ornament on the tree.
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-8 pb-24 items-stretch justify-items-center flex-1">
        {/* LEFT */}
        <div className="flex flex-col w-full max-w-[520px] h-full min-h-[520px]">
      {stage === "mint" ? (
  <div className="w-full">
    {/* Header row: MEMORY PREVIEW (center only) */}
    <div className="mb-3 w-full flex justify-center">
      <div className="text-[10px] uppercase tracking-[0.35em] text-gold/70 text-center">
        MEMORY PREVIEW
      </div>
    </div>

    <MemoryCard
      imageUrl={ornamentState.generatedImageUrl || ""}
      wish={wish}
      memoryNoText="MEMORY NO. ???"
      estText="EST. 2025"
      backgroundClassName="bg-burgundy/55 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    />
  </div>
) : (
  <div className="flex-1 flex flex-col items-center justify-between">
    <div className="w-full flex flex-col items-center justify-center gap-10">
      <div className="relative group w-72 h-72 md:w-[22rem] md:h-[22rem] shrink-0">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 rounded-full"
        />

        <div className="absolute inset-[-12px] rounded-full border border-dashed border-gold/40 animate-[spin_20s_linear_infinite] group-hover:border-gold/80 transition-colors duration-500"></div>

        <div
          className={`
            w-full h-full rounded-full flex flex-col items-center justify-center relative z-20 overflow-hidden
            border-2 border-gold/50 transition-all duration-700
            group-hover:border-gold group-hover:scale-[1.02] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]
            ${previewUrl ? "" : "bg-[#2a0506]/30"}
          `}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-full p-[8px] transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Plus className="text-gold/60 w-8 h-8 group-hover:text-gold transition-colors duration-300" />
              <span className="text-gold font-serif text-xl italic tracking-wide group-hover:text-softGold transition-colors duration-300">
                Tap to Select PFP
              </span>
            </div>
          )}
        </div>
      </div>

      {/* style pills */}
      <div className="flex flex-wrap gap-2 justify-center w-full px-4">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.id}
            onClick={() =>
              setOrnamentState((prev) => ({ ...prev, style: style.id }))
            }
            className={`px-4 py-2 rounded-full border text-[10px] md:text-xs uppercase font-bold transition-all duration-300 ${
              ornamentState.style === style.id
                ? "bg-gold text-burgundy border-gold shadow-lg scale-105"
                : "border-softGold/30 text-softGold/70 hover:bg-softGold/10"
            }`}
          >
            {style.id}
          </button>
        ))}
      </div>
    </div>

    <div className="w-full mt-10 max-w-[520px]">
      <div className="w-full flex items-center justify-between px-4 mb-2 text-xs uppercase text-gold/80">
        <span>Credits Left</span>
        <div className="flex gap-1">
          {[...Array(MAX_GENERATIONS)].map((_, i) => (
            <Zap
              key={i}
              size={12}
              className={
                i < MAX_GENERATIONS - counts.gen
                  ? "fill-gold text-gold"
                  : "text-gold/20"
              }
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={ornamentState.isGenerating || counts.gen >= MAX_GENERATIONS}
        className="w-full py-4 rounded-full bg-gold text-burgundy font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 shadow-lg flex items-center justify-center gap-3"
      >
        <span className={ornamentState.isGenerating ? "animate-pulse" : ""}>
          {ornamentState.isGenerating
            ? "Crafting Magic..."
            : walletAddress
            ? "Craft Masterpiece"
            : "Verify Invite to Craft"}
        </span>
        <Sparkles
          className={`w-4 h-4 transition-all duration-500 ${
            ornamentState.isGenerating
              ? "animate-pulse text-white scale-110"
              : "text-burgundy/40"
          }`}
        />
      </button>

      {error && (
        <div className="mt-4 text-red-300 text-[10px] uppercase tracking-widest text-center">
          {error}
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col w-full max-w-[520px] h-full min-h-[520px]">
          {stage === "mint" ? (
            <MintFlow
              imageUrl={ornamentState.generatedImageUrl!}
              description={wish || ornamentState.description || "Custom Memory"}
              userAddress={walletAddress || undefined}
              onMintComplete={handleMintComplete}
              onBack={() => setStage("studio")}
            />
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="w-full flex-1 flex flex-col min-h-0">
        
                <div className="w-full aspect-square bg-black/20 rounded-3xl flex items-center justify-center overflow-hidden border border-gold/20 relative shadow-inner">
                  {ornamentState.generatedImageUrl ? (
                    <img
                      src={ornamentState.generatedImageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-8 flex flex-col items-center justify-center gap-10 py-32 md:py-40">
                      <div className="relative">
                        <TreePine
                          className={`w-14 h-14 text-gold/30 transition-all duration-1000 ${
                            ornamentState.isGenerating
                              ? "animate-spin-slow opacity-100 scale-110"
                              : "opacity-20"
                          }`}
                        />
                        <div
                          className={`absolute -top-4 -right-4 transition-all duration-700 ${
                            ornamentState.isGenerating
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-50"
                          }`}
                        >
                          <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                        </div>
                      </div>
                      <p className="text-[12px] uppercase tracking-[0.55em] font-bold opacity-40 text-gold leading-relaxed">
                        WAITING FOR CRAFT
                      </p>
                    </div>
                  )}
                </div>

                {ornamentState.generatedImageUrl && (
                  <div className="mt-3 w-full shrink-0 h-[88px] px-2">
                    <div className="flex items-center justify-between mb-2 px-4">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                        YOUR 2026 WISH
                      </span>
                      <button
                        onClick={() => setWish(pickWish(wish))}
                        className="px-4 py-2 rounded-full border border-gold/30 text-[10px] uppercase font-bold tracking-widest text-gold/90 hover:bg-gold hover:text-burgundy transition-all"
                        type="button"
                      >
                        SHUFFLE
                      </button>
                    </div>

                    <div className="px-4">
                      <input
                        value={wish}
                        onChange={(e) => setWish(e.target.value)}
                        maxLength={WISH_MAX}
                        className="
                          w-full bg-transparent border-0 outline-none
                          font-serif italic text-[#FFDFA6] text-[14px]
                          whitespace-nowrap truncate
                          drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]
                        "
                        placeholder={`Keep it within ~${WISH_MAX} chars`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full shrink-0 mt-4">
                <div className="w-full flex justify-between items-center px-2 pb-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    Memory Slots
                  </span>
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">
                    {counts.mint} / {MAX_MINTS} Secured
                  </span>
                </div>

                <button
                  onClick={() =>
                    walletAddress ? setStage("mint") : setStage("wallet-entry")
                  }
                  disabled={!ornamentState.generatedImageUrl || counts.mint >= MAX_MINTS}
                  className="w-full py-4 rounded-full bg-gold text-burgundy font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 shadow-lg"
                >
                  {counts.mint >= MAX_MINTS
                    ? "Limit Reached"
                    : walletAddress
                    ? "Confirm & Hang on Tree"
                    : "Verify Invite to Mint"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
