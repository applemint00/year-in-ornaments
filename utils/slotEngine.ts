
import { getHash } from "./hash";

const BANDS = 6;
const SLOTS_PER_BAND = 24;
export const TOTAL_CAPACITY = BANDS * SLOTS_PER_BAND;

/**
 * TreeMesh는 group scale={TREE_SCALE}로 커집니다.
 * 여기 좌표는 "스케일 전(기본 트리)" 기준으로 잡고,
 * Tree3D에서 ornaments group에 scale을 같이 줘서 맞춥니다.
 */
const TREE_BASE_RADIUS = 4.85; // 하단 tier r=4.45보다 약간 바깥
const TREE_TOP_RADIUS = 1.6;   // 상단 tier에 맞춤
const Y_MIN = 1.15;            
const Y_MAX = 6.95;            

export const getPositionFromSlot = (
  band: number,
  slot: number
): [number, number, number] => {
  const t = band / (BANDS - 1);

  const y = Y_MIN + t * (Y_MAX - Y_MIN);

  const radius = TREE_BASE_RADIUS - t * (TREE_BASE_RADIUS - TREE_TOP_RADIUS);

  const angle = (slot / SLOTS_PER_BAND) * Math.PI * 2;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  return [x, y, z];
};

export const assignSlot = (
  id: string,
  index: number,
  isMine: boolean
): { band: number; slot: number; position: [number, number, number] } => {
  if (isMine) {
    const band = 2 + (index % 2);
    const slot = (index * 7) % SLOTS_PER_BAND;
    return { band, slot, position: getPositionFromSlot(band, slot) };
  }

  const hash = getHash(id);
  const band = hash % BANDS;
  const slot = (hash + index) % SLOTS_PER_BAND;

  return { band, slot, position: getPositionFromSlot(band, slot) };
};
