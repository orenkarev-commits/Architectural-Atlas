/**
 * Field guide: "Reading the front". Numbered pins on a building's photo, elevation or plan,
 * each naming one feature and what it shows. Written with the architectural-knowledge reading
 * method: what is drawn or visible, never inferred from style. Mirror every entry to the vault
 * (Buildings/<id> …, section "Reading the front").
 *
 * `on` picks the picture: 'photo' (the building's main image), or 'elevation' / 'plan' (the first
 * archive sheet of that kind in plans.ts). x and y are percentages of that picture.
 */
export type FieldGuidePin = { x: number; y: number; term: string; note: string };
/** `ratio` is the picture's width / height, so the pins land on the right spot at any screen width. */
export type FieldGuide = { on: 'photo' | 'elevation' | 'plan'; ratio: number; caption: string; pins: FieldGuidePin[] };

export const fieldGuides: Partial<Record<number, FieldGuide[]>> = {
  47: [
    {
      on: 'elevation',
      ratio: 1855 / 1210,
      caption: 'The original elevation (Handasa 00061310) against the front today',
      pins: [
        { x: 49, y: 28, term: 'Stair column', note: 'Glazed full height in the drawing, under a stepped cap. Today it has one small shuttered window per landing (Street View, 2011–22).' },
        { x: 14, y: 45, term: 'Projecting bays', note: 'Balconied bays with finned fronts on every floor, as drawn and as built.' },
        { x: 49, y: 84, term: 'Entrance', note: 'A double door between finials in the drawing. Today the entrance sits about six steps up, behind a stone garden wall.' },
        { x: 86, y: 72, term: 'End bays', note: 'Windows in the drawing; shopfronts there today.' },
      ],
    },
  ],
};

export function fieldGuideFor(id: number): FieldGuide[] {
  return fieldGuides[id] ?? [];
}
