
import React, { useMemo, useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Html,
  Environment,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { RotateCcw, Loader2, Crosshair, Share2, Check, X, Download } from "lucide-react";
import { useTreeData } from "../hooks/useTreeData";

// Fix: Correctly augment the React JSX namespace for React Three Fiber to avoid shadowing standard HTML elements.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

/** -------------------- Tunables -------------------- */
const TREE_GROUP_Y = -1.2; 
const TREE_SCALE = 1.3; 
const TREE_GREEN = "#11331a"; 
const GOLD = "#d4af37";
const SOFT_GOLD = "#FFDFA6";
const BULB_COLORS = ["#ff4444", "#ffd700", "#4488ff", "#ff66cc", "#ffaa33"].map(c => new THREE.Color(c));

const ORNAMENT_OFFSET = 0.95; 

const TIERS = [
  { y: 1.2, r: 5.2, h: 2.5, color: TREE_GREEN },
  { y: 3.2, r: 4.0, h: 2.2, color: TREE_GREEN },
  { y: 4.8, r: 3.0, h: 1.8, color: TREE_GREEN },
  { y: 6.1, r: 2.0, h: 1.4, color: TREE_GREEN },
  { y: 7.0, r: 1.2, h: 1.0, color: TREE_GREEN },
];

function getTreeRadiusAt(y: number) {
  for (const t of TIERS) {
    const minY = t.y - t.h / 2;
    const maxY = t.y + t.h / 2;
    if (y >= minY && y <= maxY) {
      const factor = (y - minY) / t.h;
      return t.r * (1 - factor);
    }
  }
  return 0.5;
}

/** ❄️ Snowfall Logic (Cinematic) */
const Snowfall: React.FC = () => {
  const COUNT = 8500; 
  const pointsRef = useRef<THREE.Points>(null);
  
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.8)");
    g.addColorStop(0.7, "rgba(255,255,255,0.15)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  const data = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const initialX = new Float32Array(COUNT);
    const initialZ = new Float32Array(COUNT);
    const speed = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    const radius = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = Math.random() * 70 - 15;
      const z = (Math.random() - 0.5) * 160;
      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      initialX[i] = x;
      initialZ[i] = z;
      speed[i] = 0.012 + Math.random() * 0.03; 
      phase[i] = Math.random() * 30;
      radius[i] = 1.5 + Math.random() * 4.0; 
    }
    return { pos, initialX, initialZ, speed, phase, radius };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.elapsedTime;
    const attr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= data.speed[i];
      const localT = t * 0.35 + data.phase[i];
      const sway = Math.sin(localT) * data.radius[i] * 0.6;
      const swirl = Math.cos(localT * 0.7) * data.radius[i] * 0.6;
      arr[i * 3 + 0] = data.initialX[i] + sway;
      arr[i * 3 + 2] = data.initialZ[i] + swirl;
      if (arr[i * 3 + 1] < -25) arr[i * 3 + 1] = 50;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={data.pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.58} map={texture} transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation={true} />
    </points>
  );
};

/** ✨ Tree Stardust (Internal glow) */
const TreeStardust: React.FC = () => {
  const COUNT = 600; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      const y = Math.random() * 7.5;
      const maxR = getTreeRadiusAt(y) * 0.88; 
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * maxR;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const scale = 0.4 + Math.random() * 0.8;
      const phase = Math.random() * Math.PI * 2;
      data.push({ x, y, z, scale, phase });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const s = p.scale * (1 + Math.sin(time * 2 + p.phase) * 0.2);
      dummy.position.set(p.x, p.y + Math.sin(time * 0.5 + p.phase) * 0.05, p.z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = 2.5 + Math.sin(time * 1.5) * 1.5;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.SphereGeometry(0.04, 6, 6), undefined, COUNT]}>
      <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={3} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
};

/** ✨ Fairy Lights (Surface twinkle - Layer 2) */
const FairyLights: React.FC = () => {
  const COUNT = 400; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const lights = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      const y = 0.5 + Math.random() * 7.0;
      const radius = getTreeRadiusAt(y) + 0.1; // Place slightly above the surface
      const angle = Math.random() * Math.PI * 2;
      const phase = Math.random() * Math.PI * 2;
      const color = Math.random() > 0.5 ? SOFT_GOLD : "#ffffff";
      data.push({ y, radius, angle, phase, color });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    lights.forEach((l, i) => {
      const x = Math.cos(l.angle) * l.radius;
      const z = Math.sin(l.angle) * l.radius;
      // Twinkle effect by scaling
      const s = 0.6 + Math.sin(time * 3 + l.phase) * 0.4;
      dummy.position.set(x, l.y, z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = 5 + Math.sin(time * 4) * 3;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.SphereGeometry(0.025, 6, 6), undefined, COUNT]}>
      <meshStandardMaterial color={SOFT_GOLD} emissive={SOFT_GOLD} emissiveIntensity={8} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};

/** 🌟 Tree Top Star */
const TreeTopStar: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !coreRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.5;
    const pulse = Math.sin(t * 2) * 0.1;
    coreRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    const mat = coreRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 10 + Math.sin(t * 5) * 4;
  });

  return (
    <group ref={groupRef} position={[0, 8.2, 0]}>
      <mesh ref={coreRef} castShadow>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} emissive="#ffd700" emissiveIntensity={12} />
      </mesh>
      <pointLight color="#ffd700" intensity={15} distance={25} />
    </group>
  );
};

const TreeMesh: React.FC = () => {
  return (
    <group position={[0, TREE_GROUP_Y, 0]} scale={TREE_SCALE}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.8, 24]} />
        <meshStandardMaterial color="#2d1d0f" roughness={1} />
      </mesh>
      {TIERS.map((t, idx) => (
        <group key={idx}>
          <mesh position={[0, t.y, 0]} castShadow receiveShadow>
            <coneGeometry args={[t.r, t.h, 40]} />
            <meshStandardMaterial color={t.color} roughness={0.7} metalness={0.15} />
          </mesh>
        </group>
      ))}
      <TreeTopStar />
      <TreeStardust />
      <FairyLights />
    </group>
  );
};

const SpiralLights: React.FC = () => {
  const bulbCount = 110; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < bulbCount; i++) {
      const t = i / bulbCount;
      const y = 0.8 + t * 6.8;
      const radius = getTreeRadiusAt(y) + 0.18;
      const angle = t * Math.PI * 14;
      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.scale.set(1.1, 1.1, 1.1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = 4 + Math.sin(time * 3) * 2;
    }
  });

  const colors = useMemo(() => {
    const array = new Float32Array(bulbCount * 3);
    for (let i = 0; i < bulbCount; i++) {
      BULB_COLORS[i % BULB_COLORS.length].toArray(array, i * 3);
    }
    return array;
  }, []);

  return (
    <group position={[0, TREE_GROUP_Y, 0]} scale={TREE_SCALE}>
      <instancedMesh ref={meshRef} args={[new THREE.SphereGeometry(0.1, 12, 12), undefined, bulbCount]}>
        <instancedBufferAttribute attach="instanceColor" count={bulbCount} array={colors} itemSize={3} />
        <meshStandardMaterial roughness={0} metalness={0.5} emissive="#ffffff" emissiveIntensity={4} />
      </instancedMesh>
    </group>
  );
};

const InfoCard: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?ornament=${item.id}`;
    navigator.clipboard.writeText(`Check out my 2025 memory on the Monad Tree! 🎄\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `Monad_Ornament_${item.id}.png`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error("Download failed", err); }
  };

  return (
    <Html distanceFactor={10} position={[0, 0.8, 0]} center>
      <div className="bg-[#500a0c]/95 backdrop-blur-xl border border-[#d4af37]/40 p-5 rounded-3xl w-72 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in-up text-[#FFDFA6] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative group mb-4">
           <img src={item.url} className="w-full aspect-square rounded-2xl object-cover border border-white/10 shadow-lg" alt="" />
           <button onClick={handleDownload} className="absolute top-2 right-2 p-2.5 bg-black/70 rounded-full border border-[#d4af37]/40 text-[#d4af37] shadow-lg transition-transform active:scale-90 flex items-center justify-center z-50">
             <Download size={15} />
           </button>
        </div>
        <h3 className="text-[#d4af37] font-serif font-bold text-xl mb-1.5 italic tracking-tight">{item.isMine ? "Your Masterpiece" : "Preserved Memory"}</h3>
        <p className="text-[#FFDFA6]/70 text-[11px] italic font-serif mb-5 line-clamp-2 px-2">"{item.desc || "A unique digital identity preserved forever."}"</p>
        <div className="flex gap-2">
          <button onClick={handleShare} className="flex-1 bg-[#d4af37] text-[#050b14] py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">{copied ? <Check size={14} /> : <Share2 size={14} />}{copied ? "Copied" : "Share"}</button>
          <button onClick={onClose} className="w-12 flex items-center justify-center border border-[#FFDFA6]/20 rounded-xl text-[#FFDFA6]/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
      </div>
    </Html>
  );
};

const Ornament: React.FC<{ item: any; isSelected: boolean; onSelect: (id: string | null) => void }> = ({ item, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(item.url) as THREE.Texture;
  const [hovered, setHovered] = useState(false);
  
  const outwardPos = useMemo<[number, number, number]>(() => {
    const [origX, y, origZ] = item.position as [number, number, number];
    const surfaceR = getTreeRadiusAt(y);
    const angle = Math.atan2(origZ, origX);
    return [Math.cos(angle) * (surfaceR + ORNAMENT_OFFSET), y, Math.sin(angle) * (surfaceR + ORNAMENT_OFFSET)];
  }, [item.position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.position.y = Math.sin(time * 0.4 + outwardPos[1]) * 0.08;
    
    const targetScale = isSelected ? 1.05 + Math.sin(time * 2) * 0.03 : (hovered ? 1.15 : 1.0);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      const baseEmissive = isSelected ? 0.4 + Math.sin(time * 4) * 0.3 : (hovered ? 0.6 : (item.isMine ? 0.3 : 0));
      meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(meshRef.current.material.emissiveIntensity, baseEmissive, 0.1);
    }
    meshRef.current.rotation.y += 0.008;
  });

  return (
    <group position={outwardPos}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.9]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} emissive={GOLD} emissiveIntensity={0.3} />
      </mesh>
      {item.isMine && !isSelected && (
        <Html position={[0, 0.65, 0]} center>
          <div className="bg-[#d4af37] text-[#050b14] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-bounce pointer-events-none border border-white/20">MINE</div>
        </Html>
      )}
      {isSelected && <InfoCard item={item} onClose={() => onSelect(null)} />}
      <mesh 
        ref={meshRef} 
        castShadow 
        onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.33, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={0.1} metalness={0.1} emissive={GOLD} emissiveIntensity={0} />
      </mesh>
    </group>
  );
};

const ControlsAnimator: React.FC<{ controlsRef: React.MutableRefObject<any>; focusTarget: THREE.Vector3 | null; focusCam: THREE.Vector3 | null; }> = ({ controlsRef, focusTarget, focusCam }) => {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (focusTarget && focusCam) {
      controls.target.lerp(focusTarget, 0.08);
      controls.object.position.lerp(focusCam, 0.06);
      controls.update();
    }
  });
  return null;
};

const Tree3D: React.FC<any> = ({ onReset, walletAddress, ornamentUrl }) => {
  const { ornaments: serverOrnaments, isLoading } = useTreeData(walletAddress);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const ornamentGroupRef = useRef<THREE.Group>(null);
  const mineCycleRef = useRef(0);
  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);
  const [focusCam, setFocusCam] = useState<THREE.Vector3 | null>(null);

  const ornaments = useMemo(() => {
    const items = [...serverOrnaments];
    if (!items.some(o => o.isMine) && ornamentUrl) {
      items.unshift({ id: 'local-sim-1', url: ornamentUrl, desc: "Your Festive Masterpiece", owner: walletAddress || 'guest', isMine: true, position: [2.5, 4.0, 2.5] } as any);
    }
    return items;
  }, [serverOrnaments, ornamentUrl, walletAddress]);

  const focusOnItem = (id: string | null) => {
    if (!id) {
        setSelectedId(null);
        setFocusTarget(null);
        setFocusCam(null);
        return;
    }
    const item = ornaments.find(o => o.id === id);
    const group = ornamentGroupRef.current;
    if (!item || !group) return;
    group.updateWorldMatrix(true, false);
    const [ox, oy, oz] = item.position as [number, number, number];
    const surfaceR = getTreeRadiusAt(oy);
    const angle = Math.atan2(oz, ox);
    const outwardLocal = new THREE.Vector3(Math.cos(angle) * (surfaceR + ORNAMENT_OFFSET), oy, Math.sin(angle) * (surfaceR + ORNAMENT_OFFSET));
    const worldPos = outwardLocal.clone().applyMatrix4(group.matrixWorld);
    const elevatedTarget = worldPos.clone().add(new THREE.Vector3(0, 0.6, 0));
    const camDir = new THREE.Vector3(Math.cos(angle), 0.3, Math.sin(angle)).normalize();
    setFocusTarget(elevatedTarget);
    setFocusCam(worldPos.clone().add(camDir.multiplyScalar(25.0)));
    setSelectedId(id);
  };

  useEffect(() => {
    if (!isLoading && ornaments.length > 0) {
      const sharedId = new URLSearchParams(window.location.search).get('ornament');
      if (sharedId) setTimeout(() => focusOnItem(sharedId), 1000);
    }
  }, [isLoading, ornaments]);

  return (
    <div className="w-full h-screen relative bg-[#020408] overflow-hidden text-softGold">
      <div className="absolute top-10 left-0 right-0 z-10 text-center pointer-events-none px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-[#d4af37] italic animate-fade-in-down drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]">The 2025 Tree</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-3 font-sans">Diamond Twinkle Edition</p>
      </div>
      <Canvas shadows camera={{ position: [0, 10, 40], fov: 30 }} onPointerMissed={() => focusOnItem(null)}>
        <Suspense fallback={null}>
          <Environment preset="night" />
          <Stars radius={300} depth={100} count={12000} factor={7} saturation={1} fade speed={2.5} />
          <fog attach="fog" args={["#020408", 15, 100]} />
          <ambientLight intensity={0.2} />
          <hemisphereLight color="#e6f0ff" groundColor="#ffffff" intensity={0.4} />
          <directionalLight position={[15, 25, 12]} intensity={1.5} color="#fff5cc" castShadow />
          <group position={[0, -2.8, 0]}>
            <mesh rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[180, 180]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.05} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
              <circleGeometry args={[9, 64]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
            </mesh>
          </group>
          <Snowfall />
          <TreeMesh />
          <SpiralLights />
          <group ref={ornamentGroupRef} position={[0, TREE_GROUP_Y, 0]} scale={TREE_SCALE}>
            {ornaments.map((o) => (
              <Ornament key={o.id} item={o} isSelected={selectedId === o.id} onSelect={focusOnItem} />
            ))}
          </group>
          <ControlsAnimator controlsRef={controlsRef} focusTarget={focusTarget} focusCam={focusCam} />
        </Suspense>
        <OrbitControls ref={controlsRef} target={[0, 4.2, 0]} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.05} minDistance={10} maxDistance={60} autoRotate={!selectedId} autoRotateSpeed={0.3} enableDamping dampingFactor={0.06} />
      </Canvas>
      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-5 z-20 px-8">
        <button onClick={onReset} className="h-14 bg-[#d4af37] text-[#050b14] font-bold px-10 md:px-14 rounded-full font-serif uppercase tracking-[0.15em] shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:bg-white transition-all transform active:scale-95 border border-white/20 flex items-center justify-center whitespace-nowrap text-sm">
          <RotateCcw size={18} className="mr-2.5" /> Craft More
        </button>
        {ornaments.some(o => o.isMine) && (
          <button onClick={() => {
            const myItems = ornaments.filter(o => o.isMine);
            if (myItems.length === 0) return;
            const targetId = myItems[mineCycleRef.current++ % myItems.length].id;
            focusOnItem(targetId);
          }} className="h-14 bg-black/50 backdrop-blur-xl text-[#d4af37] font-bold px-10 md:px-14 rounded-full border border-[#d4af37]/40 shadow-[0_0_25px_rgba(0,0,0,0.5)] hover:bg-[#d4af37] hover:text-[#050b14] transition-all active:scale-90 flex items-center justify-center gap-3 whitespace-nowrap">
            <Crosshair size={22} /> <span className="text-[11px] uppercase tracking-widest font-sans font-black">Find My Ornament</span>
          </button>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020408]/98 backdrop-blur-3xl">
          <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
          <p className="mt-5 text-[#d4af37] font-serif italic text-lg tracking-[0.2em] animate-pulse">Illuminating the Night...</p>
        </div>
      )}
    </div>
  );
};

export default Tree3D;
