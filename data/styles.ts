import type { BuildingStyle } from './types';

/**
 * Tel Aviv's design-style chronology — the spine of the Atlas.
 *
 * It reads as a clean progression from the late-Ottoman city through Eclecticism,
 * the modern turn and out toward Brutalism — but nothing in architecture cuts cleanly
 * from one day to the next, so the chronology also carries the TRANSITIONAL moments
 * between the major periods (`transitional: true`). Each entry explains the period and
 * lists its hallmarks; `matchStyles` is the set of `Building.style` values that belong
 * to it, which lets the map group and reveal buildings by period. `emerges` places the
 * period on the time axis; `concept` entries are cross-cutting ideas, not periods.
 */
export interface StyleEntry {
  /** Display name and route param. */
  name: string;
  kind: 'style' | 'concept';
  /** A period that bridges two majors — nothing is a clean cut. */
  transitional?: boolean;
  /** Year the period first appears in the city — its point on the time axis. */
  emerges: number;
  span: string;
  tagline: string;
  history: string;
  hallmarks: string[];
  /** Building.style values grouped under this period (for map/category filtering). */
  matchStyles?: BuildingStyle[];
  /** Back-compat single-style link (first of matchStyles). */
  filterStyle?: BuildingStyle;
}

export const styleEntries: StyleEntry[] = [
  {
    name: 'Ottoman Era',
    kind: 'style',
    emerges: 1887,
    span: 'Late Ottoman – 1909',
    tagline: 'Before the city — Jaffa and the colonies.',
    history:
      "The ground Tel Aviv grew out of. Before Ahuzat Bayit laid its first street in 1909, the coast belonged to Ottoman Jaffa and the German Templer colonies. Jaffa's building was European institutional historicism — the twin-turreted Pensionnat Saint-Joseph on Yefet Street (1880s) announcing permanence as the town pushed beyond its walls — while the Templers of Sarona built a productive agricultural landscape of wells, reservoirs and colony houses. This is the pre-city layer the modern White City would rise beside, not erase.",
    hallmarks: [
      'European institutional historicism in Jaffa (castellated, symmetrical)',
      'Local kurkar sandstone and rendered stone masonry',
      'Templer agricultural infrastructure — wells, reservoirs, colony houses',
      'Decorated tile floors, marble stairs, high halls',
    ],
    matchStyles: ['Ottoman Era'],
    filterStyle: 'Ottoman Era',
  },
  {
    name: 'Eclectic',
    kind: 'style',
    emerges: 1909,
    span: '1909 – late 1920s',
    tagline: "Tel Aviv's own — the last craft style before the machine.",
    history:
      "A style that carries this name only in Tel Aviv, and one defined as much by craft as by form. Where Europe had Jugendstil, Arts & Crafts and the Vienna Secession — each different, yet all a last push for the artisan's hand before the machine age — the young Hebrew city made its own applied-arts moment from a mixture of styles. The merchants and families who built it, long barred from building freely, poured that liberated ambition into workmanship: moulded and carved plaster, wrought and cast metal, joinery, stained and leaded glass, patterned roof tiling, quoting Renaissance, Moorish, Byzantine and Jewish-national sources at once. And you tell the buildings apart by their makers — Magidovitch's civic theatre, Levy's sculpted corners, Cherner's ornament, the young Berlin's bare silicate brick, the Krol family's own painted plaster. Eclectic, here, is the signature of the architect and the trades, not a rulebook — the artisan city just before the International Style made a universal, machine-made language the global norm.",
    hallmarks: [
      'Applied-Arts style (kin to Jugendstil / Arts & Crafts / Secession)',
      'A mixture of historical styles worn at once',
      'Carried by the crafts — plaster, metal, wood, glass and roof-tile work',
      "Read through the architect's hand and the trades, not a fixed rule",
      'Oriental and Jewish-national motifs; arches, domes, decorative roofs',
    ],
    matchStyles: ['Eclectic'],
    filterStyle: 'Eclectic',
  },
  {
    name: 'Art Deco',
    kind: 'style',
    emerges: 1923,
    span: 'mid-1920s – early 1930s',
    tagline: 'Geometry with a sense of occasion.',
    history:
      "The decorative modern that carried the city from the Eclectic toward the International — the first crack in the ornamented wall. It liked sharp prism pilasters, stepped massing, streamlined curves and a taste for the theatrical, keeping ornament but making it geometric. In Tel Aviv it dressed the first power station (1923), corner blocks such as Berlin's Beit Awad (1926), and speculative apartment houses — the Nastissin 'Common House' on Yehuda Halevi (1925–26) giving edge-of-town housing a composed, symmetrical face — just before the plainer International Style took the city over. Local Deco, more restrained than its American cousin: the machine-age geometry without the chrome.",
    hallmarks: [
      'Prism pilasters and stepped, setback forms',
      'Streamlined curves and speed-lines',
      'Ornament kept, but made geometric',
      'Flat pediments and framed openings; symmetry as argument',
    ],
    matchStyles: ['Art Deco'],
    filterStyle: 'Art Deco',
  },
  {
    name: 'Early Modernism',
    kind: 'style',
    transitional: true,
    emerges: 1930,
    span: 'early 1930s',
    tagline: 'Modern massing, still learning the language.',
    history:
      "The short moment when the ornament had fallen away but the building had not yet gone fully abstract. Early-modern houses kept a heavier, more domestic composition — a residual Eclectic symmetry, a grounded base — while balconies, recessed openings and the functional stair took over as the architecture. Dov Karmi's Balfour 57 (1933) and Cherner's Hemphel House (1932–33) sit here: the transition made visible, between the Eclectic city and the White City's full International Style.",
    hallmarks: [
      'Ornament gone, but massing still heavy and domestic',
      'Circulation and balconies become the composition',
      'A residual Eclectic symmetry or grounded base',
      'Climate handled by depth and recess, not applied device',
    ],
    matchStyles: ['Early Modernism'],
    filterStyle: 'Early Modernism',
  },
  {
    name: 'International Style',
    kind: 'style',
    emerges: 1932,
    span: '1930s – 1950s',
    tagline: 'The White City — Bauhaus under the sun.',
    history:
      "The style that made Tel Aviv famous, and it arrived by boat. Architects who had studied in Europe — many at the Bauhaus, or in the orbit of Erich Mendelsohn and Le Corbusier: Rechter, Karmi, Rubin, Averbuch — fled a darkening Europe and brought home a stripped modernism, adapting it to the Mediterranean. What began as a scatter of transitional buildings (Cherner's Hemphel House of 1932–33 still keeping an Eclectic symmetry) hardened into an established rulebook; some four thousand buildings went up this way through the 1930s, the world's largest concentration, inscribed by UNESCO in 2003 as the White City. Its genius was climatic as much as formal — flat roof and ribbon window arriving with deep shaded balconies, pergolas and pilotis to answer the sun.",
    hallmarks: [
      'Flat roofs and clean horizontal lines',
      'Ribbon windows; recessed and curved balconies',
      'Pilotis lifting the ground back to the street',
      'Rendered concrete, painted light — hence "the White City"',
      'Sun-adapted: pergolas, brise-soleil, deep shade',
    ],
    matchStyles: ['International Style'],
    filterStyle: 'International Style',
  },
  {
    name: 'Early Brutalist',
    kind: 'style',
    transitional: true,
    emerges: 1953,
    span: '1950s onward',
    tagline: 'The rules loosen — toward Brutalism.',
    history:
      "Once the International Style had become an established set of rules, the state that inherited it began to break them. Postwar public architecture grew heavier and more materially expressive than the light White-City block — monumental fronts, exposed structure and civic weight leaning toward the Brutalist. The Nadlers' Agricultural Bank (1953–55), a bank for farming that carried wheat-stalk reliefs across a monumental face opposite the wholesale market, stands at exactly this hinge: modernism turning muscular. (A single, definitive Tel Aviv Brutalist monument — and any genuine Postmodern successor — are still to be added to the Atlas rather than invented to fit.)",
    hallmarks: [
      'Monumental, materially expressive fronts',
      'Exposed structure and civic weight',
      'Relief and iconography returning at scale',
      'The White-City rulebook stretched, not yet broken into full Brutalism',
    ],
    matchStyles: ['Early Brutalist'],
    filterStyle: 'Early Brutalist',
  },
  {
    name: 'Revival',
    kind: 'concept',
    emerges: 1922,
    span: '1920s',
    tagline: 'Dressing a new building in one old empire.',
    history:
      "A strand within the eclectic decade that reached for a single, coherent historical costume rather than mixing many. Its clearest case is Berlin's Beit HaTe'omim of 1922 — a pair of doctors' houses built as one Greek temple in bare silicate brick, a colonnade and carved capitals folded down the party wall.",
    hallmarks: [
      'One historical language, not a mix',
      'Colonnades, pediments, temple fronts',
      'Symmetry used as the whole argument',
    ],
  },
  {
    name: 'Infrastructure',
    kind: 'concept',
    emerges: 1923,
    span: '1920s onward',
    tagline: 'When the machine shed is the monument.',
    history:
      "Not a style but a thread running through them: the young city's utilities, built with civic ambition and each wearing the dress of its own era. The first power station of 1923 was given an Art Deco face; the Haganah Water Tower of 1924 was left frankly functional — a concrete tank that doubled as the underground's Signal Station No. 1, flashing to the outlying settlements. Further back, the Templer reservoir stored water for Sarona's fields long before the city arrived. Engineering pressed into the service of a place inventing itself.",
    hallmarks: [
      'Function first, ornament optional',
      'Early reinforced-concrete engineering',
      'Civic symbolism grafted on — a menorah, a Deco mask',
      'Templer agricultural water infrastructure at the deep end',
    ],
  },
  {
    name: 'Silicate brick',
    kind: 'concept',
    emerges: 1922,
    span: '1920s',
    tagline: 'The wall doing its own decorating.',
    history:
      "A material and a signature at once. Where most of the city hid its structure under plaster, Joseph Berlin refused to render his walls — leaving the pale, machine-pressed sand-lime (silicate) brick bare and letting the coursing carry the ornament. He dressed it as a Greek temple on Beit HaTe'omim (1922), stepped it into a zipper on Beit Mann (1930), and used it plainly on his own Berlin House (1929). The same brick, three ways.",
    hallmarks: [
      'Sand-lime (silicate) brick, left exposed',
      'Ornament from the coursing, not from plaster',
      "Berlin's three-building thread: Beit HaTe'omim → Berlin House → Beit Mann",
    ],
  },
];

export function styleByName(name: string): StyleEntry | undefined {
  return styleEntries.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

/** The chronology, in order — the periods that place buildings on the time axis. */
export const timelineStyles = styleEntries
  .filter((s) => s.kind === 'style')
  .sort((a, b) => a.emerges - b.emerges);

/** Cross-cutting ideas shown as a chip row (Revival, Infrastructure, silicate brick). */
export const conceptStyles = styleEntries.filter((s) => s.kind === 'concept');

/** The period a building's style belongs to (for map grouping / colour). */
export function periodForStyle(style: BuildingStyle): StyleEntry | undefined {
  return timelineStyles.find((s) => (s.matchStyles ?? []).includes(style));
}
