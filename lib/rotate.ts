/** Picks `count` items starting at `start`, wrapping around the array. */
export function rotatedSlice<T>(items: T[], start: number, count: number): T[] {
  const n = items.length;
  if (n === 0) return [];
  return Array.from({ length: Math.min(count, n) }, (_, i) => items[(start + i) % n]);
}
