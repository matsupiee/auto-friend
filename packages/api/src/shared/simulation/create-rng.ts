export type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
  pick: <T>(items: readonly T[]) => T;
  weighted: <T>(items: readonly T[], weightOf: (item: T) => number) => T | undefined;
  shuffle: <T>(items: readonly T[]) => T[];
};

// シード付きの擬似乱数（mulberry32）。同じシードなら同じ世界の動きを再現できる。
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (probability) => next() < probability,
    pick: (items) => {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error("pick from empty list");
      return item;
    },
    weighted: (items, weightOf) => {
      const weights = items.map((item) => Math.max(0, weightOf(item)));
      const total = weights.reduce((sum, w) => sum + w, 0);
      if (total <= 0) return undefined;
      let threshold = next() * total;
      for (let i = 0; i < items.length; i++) {
        threshold -= weights[i] ?? 0;
        if (threshold <= 0) return items[i];
      }
      return items[items.length - 1];
    },
    shuffle: (items) => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const a = copy[i] as (typeof copy)[number];
        copy[i] = copy[j] as (typeof copy)[number];
        copy[j] = a;
      }
      return copy;
    },
  };
}
