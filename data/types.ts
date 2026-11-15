import type { ImageSourcePropType } from 'react-native';

// The style categories are exactly the classifications applied to the buildings —
// the map/atlas "By style" chips read straight from these (no separate taxonomy).
export type BuildingStyle =
  | 'Ottoman Era'
  | 'Eclectic'
  | 'Art Deco'
  | 'Early Modernism'
  | 'International Style'
  | 'Early Brutalist';

export interface Building {
  id: number;
  name: string;
  /** Must match an Architect's `name` exactly to link the profile; otherwise a plain note. */
  architect: string;
  year: number | string;
  style: BuildingStyle;
  /** Optional secondary badge, quieter styling. */
  styleNote?: string;
  /** Label shown to the user, written as read on the street. */
  address: string;
  /** Full address string, kept for reference (not geocoded at runtime — see `resolved`). */
  geo: string;
  /** Authoritative map pin + distance-sort coordinates. */
  resolved: { lat: number; lng: number };
  image: ImageSourcePropType;
  /** "Why it matters" — applies to EVERY building. Sourced from the vault's
   *  "## Why it matters" section (see scripts/sync-why-it-matters.js).
   *  NOT the same as an "innovation"/first — those live in app/innovations.tsx. */
  whyItMatters: string;
  /** "Materials & construction" */
  materials?: string;
  /**
   * "Life of the building" — a dated timeline of use/history, shown as bullets.
   * Only for buildings with a documented multi-phase life; every entry must be
   * sourced from the building's own record, never inferred.
   */
  timeline?: { year: string; note: string }[];
  /** "Research thread" — one italic line. */
  thread: string;
}

export interface ArchitectWork {
  name: string;
  year: string;
}

export interface Architect {
  name: string;
  /** Birth–death, e.g. "1877–1952". */
  years: string;
  /** Years in practice, e.g. "In Palestine from 1921; Tel Aviv 1922–1937". "Not yet documented" if unsourced. */
  active?: string;
  /** School / university. "Not yet documented" if unsourced — never invented. */
  education?: string;
  /** Style arc, e.g. "Eclectic → International Style". */
  styleArc?: string;
  school: string;
  /** Only documented, attributable quotes — empty string hides the block entirely. */
  quote: string;
  /** The story — the interesting draw: innovation, who they trained under/with, their view of architecture. */
  innovation: string;
  /** The one-line signature: their most notable building + its innovation. */
  signature?: { work: string; note: string };
  works?: ArchitectWork[];
}

export type StoryTag =
  | 'Structure'
  | 'Technology'
  | 'Reuse'
  | 'Infrastructure'
  | 'Practice'
  | 'Street life'
  | 'Two hands'
  | 'Public art'
  | 'History'
  | 'First work';

export interface Story {
  id: string;
  tag: StoryTag;
  title: string;
  place: string;
  reveal: string;
  slotId: string;
  slotHint: string;
  buildingId: number;
  buildingName: string;
}

export interface Tour {
  name: string;
  detail: string;
}
