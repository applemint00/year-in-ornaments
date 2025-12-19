
/**
 * Deterministic hash for string input
 */
export const getHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Seeded random based on hash
 */
export const getSeededRandom = (seed: string | number) => {
  const s = typeof seed === 'string' ? getHash(seed) : seed;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x);
};
