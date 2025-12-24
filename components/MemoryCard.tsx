import React from "react";

type Props = {
  imageUrl: string;
  wish: string;
  memoryNoText: string;
  badgeText?: string;
  estText?: string;
  backgroundClassName?: string;
  elevated?: boolean;
};

const MemoryCard: React.FC<Props> = ({
  imageUrl,
  wish,
  memoryNoText,
  badgeText = "DRAFT",
  estText = "EST. 2025",
  backgroundClassName,
  elevated = true,
}) => {
  const bg = backgroundClassName || "bg-[#3b0508]/70";

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "memory.png";
    a.click();
  };

  return (
    <div
      className={[
        "w-full max-w-[440px] rounded-[36px] border border-gold/25 p-6",
        bg,
        "backdrop-blur-md",
        elevated
          ? "shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/5"
          : "shadow-inner",
      ].join(" ")}
    >
      {/* Image */}
      <div className="relative rounded-[28px] overflow-hidden border border-gold/25 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <img
          src={imageUrl}
          alt="Memory"
          className="w-full aspect-square object-cover"
        />

        {/* ✅ Download button (on image) */}
        {!!imageUrl && (
          <button
            type="button"
            onClick={handleDownload}
            title="Download"
            className="
              absolute top-3 right-3 z-30
              w-9 h-9 rounded-full
              border border-gold/30
              bg-black/30 backdrop-blur
              text-gold/90
              hover:bg-black/45
              transition
              flex items-center justify-center
            "
          >
            ⬇
          </button>
        )}
      </div>

      {/* Bottom copy */}
      <div className="pt-5 text-center">
        <div className="text-[11px] uppercase tracking-[0.35em] text-gold/70">
          {memoryNoText}
        </div>

        <p
          className="mt-3 font-serif italic text-[#FFDFA6] text-[14px] leading-[18px]
                     drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 36,
          }}
          title={wish}
        >
          {wish}
        </p>

        <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-gold/45">
          {estText}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;

