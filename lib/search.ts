import type { Architect, Building } from '../data/types';

// Given names shared across multiple architects/their relatives in this
// dataset (e.g. Joseph Berlin's son is also named Ze'ev, same given name as
// Ze'ev Rechter). Naive token matching on "Ze'ev Rechter's buildings" used to
// resolve to the Brown–Rabinsky House (Joseph Berlin) instead of the Engel
// House (Ze'ev Rechter) because "Ze'ev" alone isn't enough to disambiguate.
// Stripping these and requiring surname-length tokens (>4 chars) fixes it.
// Keep this rule — see the handoff README's "Search behaviour" section.
const SHARED_GIVEN_NAMES = new Set(['josef', 'joseph', "ze'ev", 'zeev', 'dov', 'ram']);

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9']+/)
    .filter(Boolean);
}

function surnameTokens(text: string): string[] {
  return tokenize(text).filter((t) => t.length > 4 && !SHARED_GIVEN_NAMES.has(t));
}

export interface Suggestion {
  kind: 'building' | 'architect';
  title: string;
  subtitle: string;
  buildingId?: number;
  architectName?: string;
}

/** How well `hay` matches `q`: 3 = starts with, 2 = a word starts with, 1 = contains. */
function score(hay: string, q: string): number {
  const h = normalize(hay);
  if (!h) return 0;
  if (h.startsWith(q)) return 3;
  if (h.split(/[\s/,–-]+/).some((w) => w.startsWith(q))) return 2;
  if (h.includes(q)) return 1;
  return 0;
}

/**
 * Live predictive suggestions across buildings, architects and keywords — as the
 * user types, before they finish. Buildings match on name / architect / style /
 * address / styleNote (and, at low priority, their prose for keyword search);
 * architects on name / school. Ranked best-first, capped for a tidy dropdown.
 */
export function suggest(
  rawQuery: string,
  buildings: Building[],
  architects: Architect[]
): Suggestion[] {
  const q = normalize(rawQuery);
  if (!q) return [];
  const scored: { s: Suggestion; r: number }[] = [];

  for (const b of buildings) {
    const direct = Math.max(
      score(b.name, q),
      score(b.architect, q),
      score(b.style, q),
      score(b.address, q),
      score(b.styleNote ?? '', q)
    );
    const keyword =
      direct === 0 && normalize(`${b.innovation} ${b.materials} ${b.thread}`).includes(q) ? 1 : 0;
    const r = Math.max(direct, keyword);
    if (r > 0) {
      scored.push({
        s: { kind: 'building', title: b.name, subtitle: `${b.architect} · ${b.year}`, buildingId: b.id },
        r,
      });
    }
  }

  for (const a of architects) {
    const r = Math.max(score(a.name, q), score(a.school, q));
    if (r > 0) {
      scored.push({
        s: { kind: 'architect', title: a.name, subtitle: `Architect · ${a.school}`, architectName: a.name },
        r,
      });
    }
  }

  return scored
    .sort((x, y) => y.r - x.r || x.s.title.localeCompare(y.s.title))
    .slice(0, 8)
    .map((o) => o.s);
}

export function matchBuilding(
  rawQuery: string,
  buildings: Building[],
  architects: Architect[]
): Building | undefined {
  const query = normalize(rawQuery);
  if (!query) return undefined;

  // 1. Building name
  const byName = buildings.find((b) => normalize(b.name).includes(query));
  if (byName) return byName;

  // 2. Architect (as recorded on the building itself)
  const byArchitect = buildings.find((b) => normalize(b.architect).includes(query));
  if (byArchitect) return byArchitect;

  // 3. Style
  const byStyle = buildings.find((b) => normalize(b.style).includes(query));
  if (byStyle) return byStyle;

  // 4. First word of a building name
  const queryTokens = tokenize(query);
  const byFirstWord = buildings.find((b) =>
    queryTokens.includes(normalize(b.name).split(/\s+/)[0])
  );
  if (byFirstWord) return byFirstWord;

  // 5. Surname within the architect field — search each architect's own name
  // and bio prose (where relatives' given names like "Ze'ev Berlin" appear),
  // matched only on surname-length tokens with shared given names stripped.
  const querySurnames = surnameTokens(query);
  if (querySurnames.length > 0) {
    const architect = architects.find((a) => {
      const bioTokens = new Set(surnameTokens(`${a.name} ${a.innovation}`));
      return querySurnames.some((t) => bioTokens.has(t));
    });
    if (architect) {
      const byArchitectSurname = buildings.find((b) => b.architect === architect.name);
      if (byArchitectSurname) return byArchitectSurname;
    }
  }

  return undefined;
}
