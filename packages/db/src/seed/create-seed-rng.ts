// seed 用のシード付き乱数。同じシードなら毎回同じ世界ができる。
export function createSeedRng(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T>(items: readonly T[]): T => {
    const item = items[Math.floor(next() * items.length)];
    if (item === undefined) throw new Error("pick from empty list");
    return item;
  };
  return {
    next,
    pick,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    chance: (probability: number) => next() < probability,
    // 平均 mean・ばらつき spread のゆるい正規分布を 0.05〜0.95 に収める
    param: (mean = 0.5, spread = 0.2) => {
      const gaussian = (next() + next() + next() - 1.5) / 1.5;
      return Math.max(0.05, Math.min(0.95, mean + gaussian * spread * 1.5));
    },
    sample: <T>(items: readonly T[], count: number): T[] => {
      const copy = [...items];
      const result: T[] = [];
      while (result.length < count && copy.length > 0) {
        const index = Math.floor(next() * copy.length);
        result.push(copy.splice(index, 1)[0] as T);
      }
      return result;
    },
  };
}

export type SeedRng = ReturnType<typeof createSeedRng>;
