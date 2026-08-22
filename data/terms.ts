/**
 * A working dictionary for the Atlas — every term drawn from a building we actually
 * hold, so the definitions stay concrete. `seenAt` names the buildings that show it;
 * `category` groups the glossary (a construction method, a façade element, a style, or
 * a piece of history). Keep definitions plain and sourced to the collection.
 */
export type TermCategory = 'construction' | 'element' | 'style' | 'history';

export interface Term {
  term: string;
  category: TermCategory;
  definition: string;
  /** Buildings in the Atlas that demonstrate it. */
  seenAt: string[];
}

export const terms: Term[] = [
  {
    term: 'Pilotis',
    category: 'construction',
    definition:
      'Slender columns that lift a building off the ground, freeing the ground floor as open, shaded public space — a Le Corbusier idea argued in Tel Aviv as climate sense, not just style.',
    seenAt: ['Engel House'],
  },
  {
    term: 'Silicate (sand-lime) brick',
    category: 'construction',
    definition:
      'Pale, machine-pressed sand-and-lime brick. Where most of the city rendered its walls, Joseph Berlin left it bare and let the coursing do the decorating.',
    seenAt: ["Beit HaTe'omim", 'Berlin House', 'Beit Mann', 'Guter House'],
  },
  {
    term: 'Reinforced concrete frame',
    category: 'construction',
    definition:
      'A skeleton of steel-reinforced concrete that carries the loads, so the outer wall no longer has to — the technical basis for the ribbon window, the cantilever and the free façade.',
    seenAt: ['Albrecht Aberle House', 'Brown–Rabinsky House'],
  },
  {
    term: 'Kurkar',
    category: 'construction',
    definition:
      'The local calcareous sandstone of the coast, the traditional building stone of Ottoman Jaffa and the colonies. A field observation at a building base, never assumed for a whole structure without a materials report.',
    seenAt: ['Turret Building / Pensionnat Saint Joseph', 'Templer Storage Reservoir'],
  },
  {
    term: 'Thermometer window',
    category: 'element',
    definition:
      'A tall, narrow strip of glazing running up a stairwell — it lights the stair the full height of the building and reads from the street like the column of a thermometer.',
    seenAt: ['Hemphel House'],
  },
  {
    term: 'Ribbon window',
    category: 'element',
    definition:
      'A window run horizontally in a continuous band across the façade, made possible once the frame — not the wall — carries the load. A signature of the International Style.',
    seenAt: ['Engel House', 'Mazeh 16'],
  },
  {
    term: 'Cantilevered balcony',
    category: 'element',
    definition:
      'A balcony slab projecting from the frame with no columns beneath it — structural confidence turned into deep, sun-shading shade on the street front.',
    seenAt: ['Brown–Rabinsky House'],
  },
  {
    term: 'Stairwell façade',
    category: 'element',
    definition:
      'Making the vertical circulation — not the rooms — the public face of the building, so the plan is legible from the street. A recurring Tel Aviv move.',
    seenAt: ['Brown–Rabinsky House', 'Berlin House', 'Hemphel House'],
  },
  {
    term: 'Pergola',
    category: 'element',
    definition:
      'An open roof-frame of beams over a balcony or roof terrace, casting striped shade — the Mediterranean adaptation that softened imported modernism to the sun.',
    seenAt: ['Engel House'],
  },
  {
    term: 'Rusticated base',
    category: 'element',
    definition:
      'A ground floor given deep, grooved, heavy-looking masonry (often in plaster) to make a building sit solidly on its corner before lighter storeys rise above.',
    seenAt: ['Beit Lifshitz'],
  },
  {
    term: 'Pagoda / decorative roof',
    category: 'element',
    definition:
      'A steep, ornamental roof — an Eclectic flourish in a city that would soon go flat-roofed. The Pagoda House wears a Japanese-inspired one over an orientalist envelope.',
    seenAt: ['Pagoda House'],
  },
  {
    term: 'Relief iconography',
    category: 'element',
    definition:
      "Carved or cast imagery worked into the façade to declare what a building is for — wheat-stalks on a bank for agriculture; pomegranates and heraldry on an Eclectic corner.",
    seenAt: ['Agricultural Bank of Israel — Head Office', 'Beit Lifshitz'],
  },
  {
    term: 'Ottoman Era',
    category: 'style',
    definition:
      "The late-Ottoman building of Jaffa and its colonies, before Tel Aviv (to 1917): thick load-bearing masonry, arched openings and imported European institutional forms, often in local kurkar sandstone — the layer the modern city grew out of.",
    seenAt: ['Turret Building / Pensionnat Saint Joseph'],
  },
  {
    term: 'Eclectic',
    category: 'style',
    definition:
      "The founding Tel Aviv manner of the 1920s: many historical languages worn at once — European, Moorish, Byzantine, Jewish-national — as a brand-new city improvised an identity, carried by the applied-arts crafts descended from Arts & Crafts, Jugendstil and the Vienna Secession.",
    seenAt: ['Pagoda House', "Beit Ha'ir", 'Beit Krol'],
  },
  {
    term: 'Arts & Crafts movement',
    category: 'style',
    definition:
      "The reform movement begun in 1880s Britain around William Morris (1834–96): a rejection of industrial mass production for handmade craft, honest materials and dignity in labour. It flowered internationally to about 1920 and shaped the Continental movements the city's founders knew — Art Nouveau/Jugendstil and the Vienna Secession — and, in time, the Bauhaus. In Tel Aviv it survives as the plaster, metal, wood and tile craft beneath the Eclectic façade.",
    seenAt: ['Beit Bialik', 'Beit Krol', 'Pagoda House'],
  },
  {
    term: 'Jugendstil (Art Nouveau)',
    category: 'style',
    definition:
      "The German and Austrian name for Art Nouveau (c. 1895–1910), after the Munich journal Jugend ('Youth', founded 1896). A revolt against academic historicism, it favoured flowing floral ornament fused with geometric line — one of the decorative languages the Eclectic city borrowed.",
    seenAt: ['Pagoda House', 'Beit Krol'],
  },
  {
    term: 'Vienna Secession',
    category: 'style',
    definition:
      "The group founded in Vienna on 3 April 1897 by Gustav Klimt, Joseph Olbrich, Josef Hoffmann, Koloman Moser and others, breaking from the official Academy to pursue a unified art across painting, architecture and the applied arts. Adjacent to Art Nouveau but closer to the Arts & Crafts reform agenda, it belongs to the ornamental lineage behind Tel Aviv's Eclectic.",
    seenAt: ['Beit Krol', 'Pagoda House'],
  },
  {
    term: 'Art Deco',
    category: 'style',
    definition:
      'The decorative modern that bridged Eclectic and International — prism pilasters, stepped massing and streamlined curves, ornament kept but made geometric. In Tel Aviv it dressed the first power station, corner blocks and speculative apartment houses through the mid-1920s.',
    seenAt: ['The First Power Station', 'Beit Awad', 'Nastissin House / “The Common House”'],
  },
  {
    term: 'Early Modernism',
    category: 'style',
    definition:
      "Our name for the ~1930–32 turn when the historicist façade falls away — plain rendered planes, horizontal slab lines, the stair made architecture — while the massing is still heavier and more domestic than the light White-City block to come. A transitional class.",
    seenAt: ['Balfour 57', 'Balfour 42'],
  },
  {
    term: 'Bauhaus',
    category: 'style',
    definition:
      "The German art-and-design school founded by Walter Gropius in Weimar in 1919 (Dessau 1925, Berlin 1932), seeking to unify art, craft and industry with function over ornament. Nazi pressure closed it in 1933; émigré architects carried its ideas into the International Style — thousands of them built Tel Aviv's White City, a UNESCO site since 2003.",
    seenAt: ['Dizengoff Square', 'Engel House', 'Liebling House'],
  },
  {
    term: 'International Style',
    category: 'style',
    definition:
      'The stripped modernism of flat roofs, ribbon windows and rendered concrete that Bauhaus-trained émigrés adapted to the Mediterranean — the White City’s language.',
    seenAt: ['Engel House', 'Liebling House', 'Dizengoff Square'],
  },
  {
    term: 'Early Brutalist',
    category: 'style',
    definition:
      "Our name for the materially heavy 1950s modernism that leans toward Brutalism. Brutalism — from béton brut, 'raw concrete', tied to Le Corbusier and named by the critic Reyner Banham in 1955 — celebrates exposed unpainted concrete, blocky forms and expressed structure over decoration, growing out of postwar modernism.",
    seenAt: ['Agricultural Bank of Israel — Head Office'],
  },
  {
    term: 'Transitional building',
    category: 'style',
    definition:
      'A building caught between periods — modern massing still holding an Eclectic symmetry, or a colony house learning the 1930s. Proof that styles overlap rather than switch.',
    seenAt: ['Hemphel House', 'Roland Neef House', 'Nastissin House / “The Common House”'],
  },
  {
    term: 'Signal station',
    category: 'history',
    definition:
      "A rooftop or tower used by the pre-state Haganah to flash Morse and semaphore to outlying settlements. The Water Tower was Signal Station No. 1; the job later passed to the highest roofs.",
    seenAt: ['Haganah Water Tower', 'Guter House'],
  },
  {
    term: 'Adaptive reuse / conservation',
    category: 'history',
    definition:
      'Keeping a listed historic façade or structure while adding new building — the mechanism by which so much of the White City survives above altered, much-used ground floors.',
    seenAt: ['Beit Romanov', 'Hemphel House', 'Turret Building / Pensionnat Saint Joseph'],
  },
  {
    term: 'Templer colony',
    category: 'history',
    definition:
      'Sarona and its sister settlements, founded by German Templers from the 1870s as productive agricultural colonies — the pre-city landscape of wells, reservoirs and colony houses the modern city grew beside.',
    seenAt: ['Templer Storage Reservoir', 'Roland Neef House', 'Albrecht Aberle House'],
  },
  {
    term: 'Infrastructure',
    category: 'history',
    definition:
      "Not a style but a class we use for the city's working structures — water tower, power station, reservoir — where the engineering purpose, not an architectural manner, is the point.",
    seenAt: ['Haganah Water Tower', 'The First Power Station', 'Templer Storage Reservoir'],
  },
];

/** Grouped for display, in a stable category order. */
export const termCategoryOrder: TermCategory[] = ['style', 'construction', 'element', 'history'];
