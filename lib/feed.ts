import { buildings } from '../data/buildings';
import { architects } from '../data/architects';
import { stories } from '../data/stories';
import type { BuildingStyle, StoryTag } from '../data/types';
import { parseYear } from './year';

/** The ten categories every story sorts under (the Field-research filter buttons). */
export const storyCategories = [
  'Histories',
  'Street life',
  'Reuse',
  'Technology',
  'Structure',
  'First work',
  'Transition',
  'Public art',
  'Infrastructure',
  'Architects',
] as const;
export type StoryCategory = (typeof storyCategories)[number];

export interface FeedStory {
  key: string;
  category: StoryCategory;
  title: string;
  subtitle: string;
  /** Where a tap goes. */
  storyId?: string;
  buildingId?: number;
  architectName?: string;
}

const TAG_TO_CAT: Record<StoryTag, StoryCategory> = {
  History: 'Histories',
  'Two hands': 'Histories',
  Practice: 'Histories',
  'Street life': 'Street life',
  Reuse: 'Reuse',
  Technology: 'Technology',
  Structure: 'Structure',
  'First work': 'First work',
  'Public art': 'Public art',
  Infrastructure: 'Infrastructure',
};

const TRANSITIONAL = new Set<BuildingStyle>(['Early Modernism', 'Early Brutalist']);

function styleCategory(style: BuildingStyle): StoryCategory {
  if (TRANSITIONAL.has(style)) return 'Transition';
  return 'Histories';
}

/**
 * One story per building (its hand-crafted hidden history if it has one, else its
 * research thread) plus one per architect (their signature) — so every building and
 * every architect is covered, each filed under one of the ten categories.
 */
export function buildFeed(): FeedStory[] {
  const special = new Map<number, (typeof stories)[number]>();
  for (const s of stories) special.set(s.buildingId, s);

  const byYear = [...buildings].sort(
    (a, b) => (parseYear(a.year) || Infinity) - (parseYear(b.year) || Infinity)
  );

  const out: FeedStory[] = [];
  for (const b of byYear) {
    const sp = special.get(b.id);
    if (sp) {
      out.push({
        key: `s-${sp.id}`,
        category: TAG_TO_CAT[sp.tag] ?? 'Histories',
        title: sp.title,
        subtitle: `${b.name} · ${b.year}`,
        storyId: sp.id,
        buildingId: b.id,
      });
    } else {
      // No hand-written story — route to a story page derived from the building's
      // own "why it matters" prose (id `b<id>`), so every card opens a story.
      out.push({
        key: `b-${b.id}`,
        category: styleCategory(b.style),
        title: b.thread,
        subtitle: `${b.name} · ${b.year}`,
        storyId: `b${b.id}`,
        buildingId: b.id,
      });
    }
  }
  for (const a of architects) {
    out.push({
      key: `a-${a.name}`,
      category: 'Architects',
      title: a.signature ? a.signature.work : a.name,
      subtitle: a.name,
      architectName: a.name,
    });
  }
  return out;
}

export const feed = buildFeed();

/** Only the categories that actually have at least one story. */
export const activeCategories = storyCategories.filter((c) => feed.some((f) => f.category === c));
