/** First 4-digit year in a Building.year (number or string like '1924–25', 'Early 1920s'). */
export function parseYear(y: number | string): number {
  if (typeof y === 'number') return y;
  const m = String(y).match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}
