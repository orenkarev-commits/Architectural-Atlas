import { buildings } from '../data/buildings';
import { architects } from '../data/architects';
import { terms } from '../data/terms';
import { stories } from '../data/stories';
import type { AtlasAnswer, Citation } from './assistant';

// A free, on-device "Ask the Atlas": no AI model, no network, no cost. It parses the
// question for intent + entities and answers straight from the Atlas records, with
// citations and map focus. Only ever uses the data in the app.

const B = buildings as any[];
const A = architects as any[];
const T = terms as any[];
const S = stories as any[];

const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'is', 'was', 'what', 'who', 'how', 'why', 'when', 'which', 'and', 'to', 'for', 'house', 'building', 'tell', 'me', 'about', 'does', 'did', 'it', 'its', 'are', 'that']);

function words(s: string): string[] {
  return (s.toLowerCase().match(/[a-zà-ÿ']+/g) ?? []).filter((w) => w.length > 2);
}
function sentences(s: string): string[] {
  return (s.match(/[^.!?]+[.!?]+/g) ?? [s]).map((x) => x.trim());
}

function scoreName(name: string, q: string): number {
  const nq = q.toLowerCase();
  if (nq.includes(name.toLowerCase())) return 100;
  const nw = words(name).filter((w) => !STOP.has(w));
  if (!nw.length) return 0;
  const hit = nw.filter((w) => nq.includes(w)).length;
  return hit === nw.length ? 60 + hit : hit * 20;
}

function findBuilding(q: string) {
  let best: any = null;
  let bestScore = 0;
  for (const b of B) {
    const s = Math.max(scoreName(b.name, q), b.address ? scoreName(b.address, q) * 0.8 : 0);
    if (s > bestScore) {
      bestScore = s;
      best = b;
    }
  }
  return bestScore >= 20 ? best : null;
}
function findArchitect(q: string) {
  const nq = q.toLowerCase();
  let best: any = null;
  let bestScore = 0;
  for (const a of A) {
    const full = String(a.name).toLowerCase();
    const sur = full.split(/\s+/).pop() || full;
    const s = nq.includes(full) ? 100 : sur.length > 3 && nq.includes(sur) ? 50 : 0;
    if (s > bestScore) {
      bestScore = s;
      best = a;
    }
  }
  return best;
}
function findStyle(q: string): string | null {
  const nq = q.toLowerCase();
  const styles = Array.from(new Set(B.map((b) => b.style))).filter(Boolean) as string[];
  for (const st of styles) if (nq.includes(st.toLowerCase())) return st;
  if (/\beclectic\b/.test(nq)) return 'Eclectic';
  if (/international|white city|bauhaus|modernis/.test(nq)) return 'International Style';
  return null;
}
function findTerm(q: string) {
  const nq = q.toLowerCase();
  let best: any = null;
  for (const t of T) {
    if (nq.includes(String(t.term).toLowerCase())) {
      if (!best || String(t.term).length > String(best.term).length) best = t;
    }
  }
  return best;
}

function cite(b: any): Citation {
  return { type: 'building', id: b.id, name: b.name };
}
function citeArch(a: any): Citation {
  return { type: 'architect', id: null, name: a.name };
}

export function answerLocally(question: string): AtlasAnswer {
  const q = question.trim();
  const nq = q.toLowerCase();
  if (!q) return { answer: 'Ask me about a building, an architect, a style or a material in the Atlas.', citations: [], mapFocus: [] };

  const building = findBuilding(q);
  const architect = findArchitect(q);
  const style = findStyle(q);
  const term = findTerm(q);

  const wantsMaterials = /(made (of|from|with)|material|construction|built (of|from|with)|concrete|brick|stone|kurkar|silicate)/.test(nq);
  const wantsWho = /(who (built|designed|made|was)|architect|designed by|engineer)/.test(nq);
  const wantsWhen = /(when|what year|how old|date built|built in)/.test(nq);
  const wantsWhy = /(why|matter|important|significan|impact|special|influence)/.test(nq);
  const wantsList = /(all |which |list |how many |what buildings|buildings by|works by|designed)/.test(nq);

  // ── list buildings by an architect ──
  if (architect && (wantsList || /\bby\b/.test(nq)) && !wantsMaterials) {
    const sur = String(architect.name).toLowerCase();
    const theirs = B.filter((b) => String(b.architect).toLowerCase().includes(sur.split(/\s+/).pop() || sur));
    if (theirs.length) {
      const bio = architect.innovation ? ' ' + sentences(architect.innovation)[0] : '';
      return {
        answer: `${architect.name} is credited with ${theirs.length} building${theirs.length > 1 ? 's' : ''} in the Atlas: ${theirs
          .map((b) => `${b.name} (${b.year})`)
          .join(', ')}.${bio}`,
        citations: [citeArch(architect), ...theirs.map(cite)],
        mapFocus: theirs.map((b) => b.id),
      };
    }
  }

  // ── list buildings by style/period ──
  if (style && (wantsList || !building) && !wantsMaterials && !term) {
    const inStyle = B.filter((b) => String(b.style).toLowerCase() === style.toLowerCase());
    if (inStyle.length) {
      return {
        answer: `The Atlas holds ${inStyle.length} ${style} building${inStyle.length > 1 ? 's' : ''}: ${inStyle
          .map((b) => `${b.name} (${b.architect}, ${b.year})`)
          .join('; ')}.`,
        citations: inStyle.map(cite),
        mapFocus: inStyle.map((b) => b.id),
      };
    }
  }

  // ── a specific building ──
  if (building) {
    const story = S.find((s) => s.buildingId === building.id);
    const arch = A.find((a) => String(a.name).toLowerCase() === String(building.architect).replace(/ \(attributed\)$/, '').toLowerCase());
    const cites: Citation[] = [cite(building)];
    if (arch) cites.push(citeArch(arch));
    const head = `${building.name} — ${building.architect}, ${building.year}, ${building.style} · ${building.address}.`;

    if (wantsMaterials) {
      return {
        answer: building.materials ? `${head}\n\nMaterials & construction: ${building.materials}` : `${head}\n\nThe Atlas does not yet document ${building.name}'s materials.`,
        citations: cites,
        mapFocus: [building.id],
      };
    }
    if (wantsWho) {
      const bio = arch?.innovation ? '\n\n' + sentences(arch.innovation).slice(0, 2).join(' ') : '';
      return { answer: `${building.name} was designed by ${building.architect} (${building.year}).${bio}`, citations: cites, mapFocus: [building.id] };
    }
    if (wantsWhen) {
      const life = (building.timeline ?? []).slice(0, 3).map((t: any) => `${t.year}: ${t.note}`).join('\n');
      return { answer: `${building.name} was built ${building.year}.${life ? `\n\n${life}` : ''}`, citations: cites, mapFocus: [building.id] };
    }
    if (wantsWhy) {
      return { answer: `${head}\n\n${building.whyItMatters}${story ? `\n\n${story.reveal}` : ''}`, citations: cites, mapFocus: [building.id] };
    }
    // general "tell me about"
    const parts = [head, building.whyItMatters, building.materials ? `Materials: ${building.materials}` : '', story ? story.reveal : ''].filter(Boolean);
    return { answer: parts.join('\n\n'), citations: cites, mapFocus: [building.id] };
  }

  // ── an architect on their own ──
  if (architect) {
    const sur = (String(architect.name).toLowerCase().split(/\s+/).pop()) || '';
    const theirs = B.filter((b) => String(b.architect).toLowerCase().includes(sur));
    const bio = architect.innovation || [architect.years, architect.active, architect.education].filter((x: string) => x && x !== 'Not yet documented').join('; ');
    return {
      answer: `${architect.name}${architect.years ? ` (${architect.years})` : ''}.\n\n${bio}${theirs.length ? `\n\nIn the Atlas: ${theirs.map((b) => b.name).join(', ')}.` : ''}`,
      citations: [citeArch(architect), ...theirs.map(cite)],
      mapFocus: theirs.map((b) => b.id),
    };
  }

  // ── a dictionary term ──
  if (term) {
    const seen = term.seenAt?.length ? `\n\nSeen at: ${term.seenAt.join(', ')}.` : '';
    const seenB = B.filter((b) => (term.seenAt ?? []).includes(b.name));
    return { answer: `${term.term} — ${term.definition}${seen}`, citations: seenB.map(cite), mapFocus: seenB.map((b) => b.id) };
  }

  // ── keyword fallback across everything ──
  const qw = words(q).filter((w) => !STOP.has(w));
  const score = (text: string) => qw.filter((w) => text.toLowerCase().includes(w)).length;
  const hits = B.map((b) => ({ b, s: score(`${b.name} ${b.architect} ${b.style} ${b.whyItMatters ?? ''} ${b.materials ?? ''}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
  if (hits.length) {
    return {
      answer: `Here is what the Atlas has on that:`,
      citations: hits.map((h) => cite(h.b)),
      mapFocus: hits.map((h) => h.b.id),
    };
  }

  return {
    answer: `The Atlas doesn't seem to document that. Try a building name (e.g. "Engel House"), an architect, a style like Eclectic or International, or a material.`,
    citations: [],
    mapFocus: [],
  };
}
