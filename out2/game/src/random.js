/**
 * Comet Warden - Seeded Pseudo-Random Number Generator
 * High-performance, deterministic PRNG based on Mulberry32.
 */

export function createRng(initialSeed = 1337) {
  let state = (initialSeed >>> 0) || 1337;

  function nextUint32() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  }

  function next() {
    return nextUint32() / 4294967296;
  }

  function range(min, max) {
    return min + (max - min) * next();
  }

  function int(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(lo + next() * (hi - lo + 1));
  }

  function choice(items) {
    if (!items || items.length === 0) return null;
    const index = Math.floor(next() * items.length);
    return items[index];
  }

  function angle() {
    return next() * Math.PI * 2;
  }

  function boolean(chance = 0.5) {
    return next() < chance;
  }

  function sign() {
    return next() < 0.5 ? -1 : 1;
  }

  return {
    nextUint32,
    next,
    range,
    int,
    choice,
    angle,
    boolean,
    sign,
    get seed() {
      return state;
    },
    setSeed(newSeed) {
      state = (newSeed >>> 0) || 1337;
    },
  };
}
