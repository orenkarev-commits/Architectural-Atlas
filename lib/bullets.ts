// Split a prose field (innovation, materials) into readable bullet points.
// - Multi-sentence prose → one bullet per sentence.
// - A single sentence that is really a comma/semicolon list → one bullet per item.
// Common abbreviations are protected so "Mrs. M. Berlin" doesn't split apart.

const ABBR = /\b(Mr|Mrs|Ms|Dr|St|Sq|No|no|vs|etc|c|Ave|Blvd|Prof|Rd|Ln|Jr|Sr)\.(?=\s)/g;
const PROT = '␑'; // placeholder for a protected period

export function toBullets(text: string): string[] {
  if (!text) return [];
  const guarded = text.replace(ABBR, (m) => m.replace('.', PROT));

  const sentences = (guarded.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [guarded])
    .map((s) => s.replace(new RegExp(PROT, 'g'), '.').trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const parts = text
      .replace(/\.\s*$/, '')
      .split(/[;,]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 3) return parts;
  }
  return sentences.length ? sentences : [text.trim()];
}
