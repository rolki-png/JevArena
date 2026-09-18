/** Mulberry32 — small deterministic RNG from a numeric seed. */
export function nextRng(state: number): { value: number; rng: number } {
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value: result, rng: t };
}
