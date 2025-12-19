
import { DecorInstance } from '../types/tree';
import { getSeededRandom, getHash } from './hash';
import { getPositionFromSlot } from './slotEngine';

const GLOBAL_SEED = "MONAD_FESTIVE_2025_V1";

export const generateDecor = (): DecorInstance[] => {
  const decors: DecorInstance[] = [];
  const seedHash = getHash(GLOBAL_SEED);

  // 1. Ribbons (Burgundy) - ~40 pieces
  for (let i = 0; i < 48; i++) {
    const r1 = getSeededRandom(seedHash + i + "r_band");
    const r2 = getSeededRandom(seedHash + i + "r_slot");
    const band = Math.floor(r1 * 6);
    const slot = Math.floor(r2 * 24);
    
    const [x, y, z] = getPositionFromSlot(band, slot);
    // Offset slightly outward
    const scale = 1.05;
    
    decors.push({
      type: 'ribbon',
      position: [x * scale, y, z * scale],
      rotation: [0, (r2 * Math.PI * 2), 0.3],
      scale: 0.2 + r1 * 0.1,
      color: '#500a0c'
    });
  }

  // 2. Fairy Lights (Point Sprites) - ~150 pieces
  for (let i = 0; i < 150; i++) {
    const r1 = getSeededRandom(seedHash + i + "f_h");
    const r2 = getSeededRandom(seedHash + i + "f_a");
    const t = r1; // height factor
    const y = (t * 6.5) + 0.5;
    const radius = 3.6 * (1 - t * 0.9);
    const angle = r2 * Math.PI * 2;
    
    decors.push({
      type: 'fairy',
      position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      rotation: [0, 0, 0],
      scale: 0.05,
      color: i % 2 === 0 ? '#FFDFA6' : '#d4af37'
    });
  }

  // 3. Icicle Drop Lights - ~80 pieces
  for (let i = 0; i < 80; i++) {
    const r1 = getSeededRandom(seedHash + i + "i_b");
    const r2 = getSeededRandom(seedHash + i + "i_s");
    const band = Math.floor(r1 * 5); // Avoid top band
    const slot = Math.floor(r2 * 24);
    const [x, y, z] = getPositionFromSlot(band, slot);
    
    decors.push({
      type: 'icicle',
      position: [x * 1.02, y - 0.2, z * 1.02],
      rotation: [0, 0, 0],
      scale: 0.15 + r1 * 0.2,
      color: '#ffffff'
    });
  }

  return decors;
};
