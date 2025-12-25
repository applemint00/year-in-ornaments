import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Copy, Loader2, Wifi, WifiOff, Zap, AlertCircle } from "lucide-react";
import { ArcService } from "../services/arcService"; 
import { isSupabaseConfigured } from "../lib/supabaseClient";

const StarImg = "/images/gold-star.png";

interface Props {
  onComplete: (address: string, counts: { gen: number; mint: number }) => void;
  onSkip: () => void;
}

type Phase = "init" | "input" | "verifying" | "invited" | "exit";

const TUNE = {
  CARD_SCALE_MOBILE: 1.42,
  CARD_SCALE_DESKTOP: 1.0,
  CARD_BOTTOM_MOBILE: "-22vh",
  CARD_BOTTOM_DESKTOP: "-15vh",
  CARD_X_PX: -30,
  CARD_POS_Y_MOBILE: 18,
  CARD_POS_Y_DESKTOP: 20,
  TEXT_X_PX: 0,
  TEXT_BOTTOM_MOBILE: "44vh",
  TEXT_BOTTOM_DESKTOP: "46vh",
  HINT_BOTTOM_MOBILE: "10vh",
  HINT_BOTTOM_DESKTOP: "10vh",
};

function useTypewriter(text: string, speedMs = 26, active = true) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) {
        setOut("");
        return;
    } 
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speedMs);
    return () => clearInterval(t);
  }, [text, speedMs, active]);
  return out;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

export default function WalletEntry({ onComplete, onSkip }: Props) {
  const [address, setAddress] = useState("");
  const [phase, setPhase] = useState<Phase>("init");
  const [displayMessages, setDisplayMessages] = useState<string[]>(["Checking list...", "Please wait."]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [nextAction, setNextAction] = useState<() => void>(() => () => {});
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const isMobile = useIsMobile();

  const [particles] = useState(() => {
    const STAR_SIZES = ["60px", "90px", "130px", "160px"];
    return Array.from({ length: 48 }).map((_, i) => {
      const isLeft = i % 2 === 0;
      const minX = isLeft ? 0 : 50;
      const maxX = isLeft ? 50 : 100;
      return {
        id: i,
        left: `${minX + Math.random() * (maxX - minX)}%`,
        top: `${Math.random() * 100}%`, 
        size: STAR_SIZES[Math.floor(Math.random() * STAR_SIZES.length)],
        duration: `${3 + Math.random() * 4}s`,
        delay: `${Math.random() * 5}s`,
        rotation: Math.random() * 360,
      };
    });
  });

  useEffect(() => {
    const t = setTimeout(() => setPhase("input"), 250);
    return () => clearTimeout(t);
  }, []);

  /**
   * 🧼 Address Sanitizer
   * Removes any whitespace, invisible characters, and normalizes to lowercase.
   */
  const sanitize = (raw: string) => {
    return raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setAddress(sanitize(text));
    } catch (e) {
      console.error("Clipboard failed:", e);
    }
  };

  /**
   * ✨ Auto-fill from Wallet
   * Provides a way to get the correct address without manual typing.
   */
  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    try {
      const user = await ArcService.connectWallet();
      setAddress(sanitize(user.address));
    } catch (e: any) {
      console.warn("Auto-fill cancelled or failed:", e.message);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const resetForm = () => {
    setPhase("exit");
    setTimeout(() => {
        setAddress("");
        setPhase("init");
        setTimeout(() => setPhase("input"), 100);
    }, 850);
  };

  const handleSubmit = async () => {
    const cleanAddr = sanitize(address);
    if (!cleanAddr || !/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
        setDisplayMessages(["Invalid format.", "Check the address."]);
        setMsgIndex(0);
        setPhase("invited");
        setNextAction(() => resetForm);
        return;
    }

    setPhase("verifying");

    try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1200));
        const checkPromise = ArcService.checkEligibility(cleanAddr);
        const [_, result] = await Promise.all([minLoadingTime, checkPromise]);

        if (result.status === 'COMPLETED') {
            setDisplayMessages(["Welcome back.", "Your spot is reserved."]);
            setNextAction(() => onSkip);
        } else if (result.status === 'ELIGIBLE') {
            setDisplayMessages(["Identity Verified.", "Access Granted."]);
            const counts = {
                gen: result.data?.generation_count || 0,
                mint: result.data?.mint_count || 0
            };
            setNextAction(() => () => onComplete(cleanAddr, counts));
        } else {
            setDisplayMessages(["Name not found.", "Access Denied."]);
            setNextAction(() => resetForm); 
        }
    } catch (error) {
        console.error("Check failed", error);
        setDisplayMessages(["System Error.", "Please try again."]);
        setNextAction(() => resetForm);
    }

    setPhase("invited");
    setMsgIndex(0);
  };

  const handleInvitedClick = () => {
    if (msgIndex < displayMessages.length - 1) {
      setMsgIndex((v) => v + 1);
      return;
    }
    
    if (nextAction.name === "resetForm") {
        nextAction();
    } else {
        setPhase("exit");
        setTimeout(() => {
            nextAction(); 
        }, 850);
    }
  };

  const showInvited = phase === "invited";
  const currentMsg = displayMessages[msgIndex] || ""; 
  const typed = useTypewriter(currentMsg, 26, showInvited);
  const typingDone = useMemo(
    () => typed.length >= currentMsg.length,
    [typed, currentMsg]
  );

  const cardScale = isMobile ? TUNE.CARD_SCALE_MOBILE : TUNE.CARD_SCALE_DESKTOP;
  const cardBottom = isMobile ? TUNE.CARD_BOTTOM_MOBILE : TUNE.CARD_BOTTOM_DESKTOP;
  const cardPosY = isMobile ? TUNE.CARD_POS_Y_MOBILE : TUNE.CARD_POS_Y_DESKTOP;
  const textBottom = isMobile ? TUNE.TEXT_BOTTOM_MOBILE : TUNE.TEXT_BOTTOM_DESKTOP;
  const hintBottom = isMobile ? TUNE.HINT_BOTTOM_MOBILE : TUNE.HINT_BOTTOM_DESKTOP;

  return (
    <div
      className={`
        fixed inset-0 z-[60] bg-[#500a0c] overflow-hidden
        transition-opacity duration-700
        ${phase === "exit" ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p) => (
          <img
            key={p.id}
            src={StarImg}
            alt=""
            className="absolute object-contain animate-shimmer"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotation}deg)`,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: 0.5, 
            }}
          />
        ))}
      </div>

      {/* View Tree Button (Top Right) */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-center gap-2 cursor-pointer group animate-fade-in">
        <div 
          onClick={onSkip} 
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/20 backdrop-blur-md border border-[#d4af37]/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#d4af37] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        >
          <img 
            src="/images/gold-tree.png" 
            alt="Global Tree" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <span 
          onClick={onSkip}
          className="text-[#FFDFA6] font-serif text-[10px] tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_rgba(212,175,55,0.8)] text-center"
        >
          View Yearbook
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-30 w-full flex justify-center">
        <div
          className={`
            w-full max-w-[640px] px-6 pt-[9vh]
            flex flex-col items-center gap-7
            transition-all duration-700 ease-out
            ${phase === "init" ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100"}
          `}
        >
          <div className="text-center space-y-2">
            <h1 className="font-serif text-[#d4af37] text-5xl md:text-6xl leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              The Guestlist
            </h1>
            <p className="text-xs md:text-sm tracking-[0.22em] uppercase text-[#FFDFA6]/60">
              Present your invitation 
            </p>
          </div>

          <div className="w-full relative max-w-[480px]">
            <div className="relative group">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="0x..."
                className="
                  w-full bg-black/40
                  border border-[#d4af37]/25
                  focus:border-[#d4af37]/70
                  text-[#FFDFA6]
                  placeholder-[#FFDFA6]/20
                  py-4 pl-6 pr-24
                  rounded-2xl
                  text-center font-mono text-base md:text-lg
                  backdrop-blur-md
                  focus:outline-none
                  transition-all
                  shadow-lg
                  group-hover:border-[#d4af37]/40
                "
                disabled={phase !== "input"}
                autoFocus={phase === "input"}
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={handleAutoFill}
                  disabled={phase !== "input" || isAutoFilling}
                  className="p-2 text-[#FFDFA6]/40 hover:text-[#d4af37] transition-all disabled:opacity-20"
                  title="Auto-fill from Wallet"
                >
                  {isAutoFilling ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                </button>
                <div className="w-[1px] h-4 bg-[#d4af37]/20"></div>
                <button
                  onClick={handlePaste}
                  disabled={phase !== "input"}
                  className="p-2 text-[#FFDFA6]/40 hover:text-[#FFDFA6] transition-all disabled:opacity-20"
                  title="Paste Address"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!address || phase !== "input"}
                className="
                  bg-[#d4af37] text-[#681719]
                  px-10 py-3 rounded-full
                  font-bold uppercase tracking-[0.2em] text-sm
                  hover:bg-white transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center gap-2
                  shadow-[0_0_24px_rgba(212,175,55,0.18)]
                  active:scale-95
                "
              >
                Verify Identity <ArrowRight size={16} />
              </button>
            </div>

            {phase === "verifying" && (
              <div className="mt-5 flex items-center justify-center gap-2 text-[#FFDFA6]/70 text-xs tracking-[0.2em] uppercase">
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                Checking invitation…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Animated Card (Design Maintained) */}
      <div
        className={`
          fixed left-0 right-0 bottom-0
          z-10 pointer-events-none
          transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)]
          ${phase === "init" ? "translate-y-[120%]" : "translate-y-0"}
          ${phase === "exit" ? "translate-y-[120%]" : ""}
        `}
      >
        <div className="relative mx-auto w-full max-w-[1400px] h-[92vh] md:h-[96vh] overflow-hidden">
          <img
            src="/hand_card.png"
            alt="Hand holding invitation"
            draggable={false}
            className="absolute left-1/2 bottom-0 w-full h-full select-none drop-shadow-2xl"
            style={{
              transform: `translateX(calc(-50% + ${TUNE.CARD_X_PX}px)) scale(${cardScale})`,
              bottom: cardBottom as any,
              objectFit: "cover",
              objectPosition: `50% ${cardPosY}%`,
            }}
          />

          {showInvited && (
            <div
              className="absolute left-1/2 pointer-events-auto"
              style={{
                bottom: textBottom,
                transform: `translateX(calc(-50% + ${TUNE.TEXT_X_PX}px))`,
              }}
              onClick={handleInvitedClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleInvitedClick();
              }}
            >
              <div
                className="font-serif italic text-[#FFDFA6] text-3xl md:text-4xl leading-none cursor-pointer select-none"
                style={{
                  textShadow:
                    "0 2px 2px rgba(0,0,0,0.34), 0 10px 38px rgba(0,0,0,0.28)",
                  filter: "drop-shadow(0px 3px 7px rgba(0,0,0,0.22))",
                }}
              >
                {typed}
                <span
                  className={`ml-1 inline-block w-[10px] ${
                    typingDone ? "opacity-30" : "animate-[blink_0.8s_infinite]"
                  }`}
                  style={{ color: "rgba(255,223,166,0.9)" }}
                >
                  |
                </span>
              </div>
            </div>
          )}

          {showInvited && (
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{ bottom: hintBottom }}
            >
              <div className="text-center text-[#FFDFA6]/18 text-[10px] tracking-[0.22em] uppercase">
                click to continue
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { 
            opacity: 0.4; 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1) drop-shadow(0 0 0 rgba(212, 175, 55, 0));
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05) rotate(5deg); 
            filter: brightness(1.3) drop-shadow(0 0 10px rgba(255, 223, 166, 0.6));
          }
          100% { 
            opacity: 0.4; 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1) drop-shadow(0 0 0 rgba(212, 175, 55, 0));
          }
        }
        .animate-shimmer {
          animation-name: shimmer;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}