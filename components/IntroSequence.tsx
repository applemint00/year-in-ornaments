import React, { useEffect, useState } from 'react';

// ❗ public/images/gold-star.png 파일 경로 확인
const StarImg = "/images/gold-star.png"; 

interface Props {
  onComplete: () => void;
}

const IntroSequence: React.FC<Props> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);
  const [stage, setStage] = useState(0);

  // ✨ 별 파티클 설정 (사이즈 대폭 상향!)
  const particles = Array.from({ length: 40 }).map((_, i) => {
    // 30%는 고정(배경), 70%는 반짝임
    const isStatic = Math.random() < 0.3; 
    
    return {
      id: i,
      type: isStatic ? 'static' : 'twinkle',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      
      // 📏 [핵심 수정] 사이즈를 아주 다양하고 과감하게 키웠습니다.
      // 고정 별(Static): 60px ~ 160px (배경에 웅장하게 깔림)
      // 반짝 별(Twinkle): 25px ~ 70px (확실하게 눈에 띄는 반짝임)
      size: isStatic 
        ? `${60 + Math.random() * 100}px` 
        : `${25 + Math.random() * 45}px`,
      
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`,
      
      // 큰 별일수록 은은하게 깔아줘서 텍스트를 방해하지 않으면서 깊이감을 줌
      baseOpacity: isStatic ? 0.3 + Math.random() * 0.4 : 1, 
      rotation: Math.random() * 360,
    };
  });

  useEffect(() => {
    const timers: number[] = [];
    
    // 1. 전체 화면 페이드 인
    timers.push(setTimeout(() => setOpacity(1), 100) as unknown as number);
    
    // 2. 텍스트 순차 등장
    timers.push(setTimeout(() => setStage(1), 2000) as unknown as number); 
    timers.push(setTimeout(() => setStage(2), 4500) as unknown as number); 
    
    // 3. 종료 시퀀스
    timers.push(setTimeout(() => {
        setOpacity(0);
        timers.push(setTimeout(onComplete, 1200) as unknown as number);
    }, 6500) as unknown as number);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#500a0c] overflow-hidden transition-opacity duration-1000"
      style={{ opacity }}
    >
      {/* 🌌 Stars Layer (배경 별) */}
      {particles.map((p) => (
        <img
          key={p.id}
          src={StarImg}
          alt=""
          className={`absolute object-contain ${
            p.type === 'twinkle' ? 'animate-twinkle' : ''
          }`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.baseOpacity,
            transform: `rotate(${p.rotation}deg)`,
            
            // 반짝이는 별만 애니메이션 적용
            animationDelay: p.type === 'twinkle' ? p.delay : undefined,
            animationDuration: p.type === 'twinkle' ? p.duration : undefined,
            
            // 필터: 반짝이는 건 밝고 쨍하게, 배경은 부드럽게
            filter: p.type === 'twinkle' 
              ? 'drop-shadow(0 0 10px rgba(255, 223, 166, 0.7)) brightness(1.2)' 
              : 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.2)) opacity(0.8)',
          }}
        />
      ))}

      {/* 📜 텍스트 컨텐츠 (z-index가 10이라서 별 위에 뜹니다) */}
      <div className="text-center space-y-8 max-w-3xl px-8 relative z-10">
        {stage === 0 && (
          <h1 className="text-5xl md:text-7xl font-serif text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-fade-in-up">
            The Year in Ornaments
          </h1>
        )}
        
        {stage === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-serif text-[#FFDFA6]">
              Immortalize your digital identity
            </h2>
            <div className="w-16 h-[1px] bg-[#d4af37]/50 mx-auto"></div>
            <p className="text-[#d4af37]/80 italic font-serif text-lg">
              "From PFP to 3D Masterpiece"
            </p>
          </div>
        )}

        {stage === 2 && (
          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
            <div className="relative">
              <div className="absolute inset-0 bg-[#d4af37] blur-xl opacity-20 rounded-full animate-pulse"></div>
              <p className="text-2xl font-sans text-[#FFDFA6] tracking-[0.3em] uppercase border-y border-[#d4af37]/30 py-4 px-8">
                Entering The Studio
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 🎬 애니메이션 스타일 */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0.6) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1) rotate(10deg); 
          }
        }

        .animate-twinkle {
          animation-name: twinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default IntroSequence;