import type { ImageSourcePropType } from 'react-native';

/**
 * Archival drawings, keyed by building id — the earliest plans and elevations held
 * for each building, pulled from the municipal Handasa engineering archive at full
 * resolution (see the vault's `Plans/` folder for provenance).
 *
 * These live on the BUILDING side of the Atlas, never in an architect's biography
 * (see the atlas-generator skill). Metro needs static `require()`s, so each sheet is
 * listed explicitly. Files are named address-first and numbered per project
 * (e.g. `Mazeh-16-01-elevation-1932`), matching the vault.
 *
 * Curation rule: **plans and elevations only — no sections.** Where both a plan and an
 * elevation survive, both are listed. Where a building's own original drawings were
 * never digitised, the oldest available sheet is shown instead, and `caption` says so
 * and places it in the building's chronology. `year` is the drawing's own date, which
 * is not always the build year — that gap is the point of the note.
 */

export type PlanKind = 'plan' | 'elevation' | 'section' | 'site';

export interface Plan {
  src: ImageSourcePropType;
  kind: PlanKind;
  /** The drawing's own year (may differ from the build year — see caption). */
  year: number;
  /** Full date as read off the sheet / archive row. */
  date: string;
  /** Where this sheet sits in the building's timeline, and why it is the one shown. */
  caption: string;
  /** Provenance. */
  source: string;
}

const HANDASA = 'Tel Aviv Handasa engineering archive';
const EXHIBITION = 'Tel Aviv "Modern Architecture" exhibition (photographed print)';

export const plansFor: Partial<Record<number, Plan[]>> = {
  18: [
    {
      src: require('../assets/images/plans/dizengoff-square-01-averbuch-sketch-1934.jpg'),
      kind: 'plan',
      year: 1934,
      date: '1934',
      caption:
        "Genia Averbuch's winning entry in the 1934 competition for the square — the round plaza ringed by a continuous band of International-Style buildings that was actually built. The sketch she submitted.",
      source: EXHIBITION,
    },
  ],
  56: [
    {
      src: require('../assets/images/plans/Idelson-30-02-plan.jpg'),
      kind: 'plan',
      year: 0,
      date: 'undated (archive 1/1/1900)',
      caption:
        'Undated floor plan from the same building file (archive placeholder 1/1/1900); not dated on the sheet, so it may record a later state of the 1922 house.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Idelson-30-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: 'undated (archive 1/1/1900)',
      caption:
        'Undated elevation (archive placeholder 1/1/1900): a symmetric two-storey front with pointed-arch ground-floor windows under shuttered upper windows, the same arches the house still shows on Idelson Street.',
      source: HANDASA,
    },
  ],
  7: [
    {
      src: require('../assets/images/plans/Balfour-38-01-plan-1941.jpg'),
      kind: 'plan',
      year: 1941,
      date: '8/12/1941',
      caption:
        "Signed alteration plan of 8 Dec 1941, from the Pittman School's conversion of the villa. The original early-1920s drawings are lost, and these alteration sheets are the best surviving evidence of the plan.",
      source: HANDASA,
    },
  ],
  32: [
    {
      src: require('../assets/images/plans/Bialik-27-01-plan.jpg'),
      kind: 'plan',
      year: 0,
      date: 'undated (archive 1/1/1900)',
      caption:
        "Undated sheet (archive placeholder 1/1/1900) for adding two storeys: its plan draws the canted, rounded front bay that still fronts Bialik Square, with an earlier elevation crossed out beneath. No dated original of the 1925 building is digitised.",
      source: HANDASA,
    },
  ],
  13: [
    {
      src: require('../assets/images/plans/Shadal-5-01-plan-1958.jpg'),
      kind: 'plan',
      year: 1958,
      date: '3/3/1958',
      caption:
        "Berlin's original drawings aren't digitised; this signed 1958 sheet is the earliest clear one — a floor plan of the synagogue (the prayer hall, entrance and courtyard). A later chapter, shown for want of the first.",
      source:
        HANDASA + ' — file 00510050 (Shadal 3–5); signed plan, 3 Mar 1958.',
    },
  ],
  11: [
    {
      src: require('../assets/images/plans/Mazeh-9-01-elevation-BarOr.jpg'),
      kind: 'elevation',
      year: 0,
      date: 'undated (conservation)',
      caption:
        "No Handasa file is digitised for the Twins House; this measured/rendered front elevation — the two mirrored wings, their colonnade and the twin towers over the central arch — is from the conservation architect's record of the 2002–03 restoration.",
      source:
        'Amnon Bar Or – Tal Gazit Architects (conservation architect), amnon-baror.co.il',
    },
  ],
  55: [
    {
      src: require('../assets/images/plans/Bialik-19-01-plan-2018.jpg'),
      kind: 'plan',
      year: 2018,
      date: '28/2/2018',
      caption:
        "Berlin's 1922 originals aren't digitised; this floor plan is from the 2018 signed conservation set (Amnon Bar Or) — the symmetric neo-classical villa with its central stair. A record of the surviving plan, not the original permit.",
      source:
        HANDASA + ' — file 00230190 (Bialik 19); signed conservation plans, 28 Feb 2018.',
    },
  ],
  65: [
    {
      src: require('../assets/images/plans/Balfour-14-01-site-historic.jpg'),
      kind: 'site',
      year: 0,
      date: 'undated (historic)',
      caption:
        "No signed drawing is digitised; the file's only historic sheets are two faint, undated \u2018unsigned plans\u2019 (the archive marks them low-quality). This one is a parcel plan on Balfour titled \u2018the Strauss Health House\u2019 — contrast-enhanced here to read at all.",
      source:
        HANDASA + ' — file 00160141 (Balfour 14); undated unsigned plan (\u05EA\u05D5\u05DB\u05E0\u05D9\u05D5\u05EA \u05DC\u05D0 \u05D7\u05EA\u05D5\u05DE\u05D5\u05EA), 1/1/1900 placeholder.',
    },
  ],
  52: [
    {
      src: require('../assets/images/plans/Balfour-42-02-plan-1931.jpg'),
      kind: 'plan',
      year: 1931,
      date: '6/9/1931',
      caption:
        "Signed permit-plan of 6 Sept 1931 — the building's own year, from the original permit set.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Balfour-42-01-elevation-2006.jpg'),
      kind: 'elevation',
      year: 2006,
      date: '14/8/2006',
      caption:
        "Cherner's 1931 originals aren't digitised; this elevation from the 2006 conservation-and-addition set shows his rounded-balconied base (marked \u2018no change\u2019) beneath the later Bar Orian upper floors. A record of the preserved front, not the original permit.",
      source:
        HANDASA + ' — file 00080810 (Balfour 42 / Rothschild 81); conservation elevations, 14 Aug 2006.',
    },
  ],
  62: [
    {
      src: require('../assets/images/plans/Bezalel-Yafe-7-01-site-1939.jpg'),
      kind: 'site',
      year: 1939,
      date: '10/12/1939',
      caption:
        "The original 1925 drawings aren't digitised; the oldest historic sheet is this 1939 site plan (1:250) for a soakaway pit — its title names the owner, \u2018the house of Mrs. Yocheved Oplatka, Ahad Ha\u2019am 66 corner Bezalel Yafe,\u2019 and draws the rounded-corner block on its trapezoidal plot.",
      source:
        HANDASA + ' — file 00110660 (Ahad Ha\u2019am 66 / Bezalel Yafe 7); historic site plan approved 10 Dec 1939.',
    },
  ],
  61: [
    {
      src: require('../assets/images/plans/Ahad-Haam-80-02-plan-1929.jpg'),
      kind: 'plan',
      year: 1929,
      date: '13/12/1929',
      caption:
        "Signed permit-plan of 13 Dec 1929 — the building's own year; the scan is a poor photocopy, but it is the earliest dated sheet on file.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Ahad-Haam-80-01-elevation-2016.jpg'),
      kind: 'elevation',
      year: 2016,
      date: '23/6/2016',
      caption:
        "Berlin's 1929 originals aren't digitised; this measured façade elevation is from the 2016–19 conservation set — the flat-roofed silicate-brick front (the sheet notes the 1933 brickwork and a 1954 addition). A record of the façade, not the original permit.",
      source:
        HANDASA + ' — file 00110800 (Ahad Ha\u2019am 80 / Mazeh 40); conservation elevations, 23 Jun 2016.',
    },
  ],
  57: [
    {
      src: require('../assets/images/plans/Bialik-9-01-plan-2013.jpg'),
      kind: 'plan',
      year: 2013,
      date: '28/8/2013',
      caption:
        "Pinhas Hütt's 1928 originals aren't digitised; this upper-floor plan is from the 2013 signed conservation set — the T-shaped plan with its stair and balconies. A later chapter, shown for want of the first.",
      source:
        HANDASA + ' — file 00230090 (Gush 6913/35); signed conservation plans, 28 Aug 2013.',
    },
  ],
  67: [
    {
      src: require('../assets/images/plans/Mapu-3-01-plan-2012.jpg'),
      kind: 'plan',
      year: 2012,
      date: '24/10/2012',
      caption:
        "Shulman's original 1937 drawings aren't digitised; this upper/roof-level plan from the 2012 conservation permit is the earliest signed sheet on file — the two masses and their recessed-balcony seam legible in plan. A later chapter, shown for want of the first.",
      source:
        HANDASA + ' — file 00970030 (Gush 6968/141); signed conservation plans, 24 Oct 2012.',
    },
  ],
  66: [
    {
      src: require('../assets/images/plans/HaYarkon-52-02-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '12/11/1933',
      caption:
        'Signed permit-plan stamped 12 Nov 1933 — a later permit, about a decade after the 1922 house; the original drawings are not digitised.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/HaYarkon-52-01-elevation-2008.jpg'),
      kind: 'elevation',
      year: 2008,
      date: '29/10/2008',
      caption:
        "Beit Ussishkin's own 1922 drawings aren't digitised; this is the Allenby-Street elevation (1:100) from the conservation set — the historic two-storey masonry base and its arched windows drawn beneath the later steel-and-glass addition. A measured record of the façade, not the original permit.",
      source:
        HANDASA + ' — file 00040070 (Gush 6909/21); historic-preservation drawings, 29 Oct 2008.',
    },
  ],
  27: [
    {
      src: require('../assets/images/plans/Ben-Gurion-17-02-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: 'undated (archive 1/1/1900)',
      caption:
        "Undated permit sheet (archive placeholder 1/1/1900): a two-storey flat-roofed block with paired shuttered windows, the same window rhythm as the street face today, drawn with its ground-floor plan and a section.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Ben-Gurion-17-01-plan-1946.jpg'),
      kind: 'plan',
      year: 1946,
      date: '13/3/1946',
      caption:
        "Original not digitised. David Tobia's 1931 permit (no. 723) for the modest one-family house isn't on file; the oldest signed sheet is this 1946 expansion — a later chapter, shown for want of the first.",
      source: HANDASA,
    },
  ],
  21: [
    {
      src: require('../assets/images/plans/Nachalat-Binyamin-16-02-elevation-1935.jpg'),
      kind: 'elevation',
      year: 1935,
      date: '14/2/1935',
      caption:
        'Signed permit-elevation of 14 Feb 1935 — a later permit sheet, about a decade after the 1924 house; the original drawings are not digitised.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Nachalat-Binyamin-16-01-plan-1935.jpg'),
      kind: 'plan',
      year: 1935,
      date: '14/2/1935',
      caption:
        "Original not digitised. Ze'ev Rechter's 1924 drawings for his very first building aren't on file; the oldest signed sheet is this 1935 alteration — eleven years on, shown for want of the first.",
      source: HANDASA,
    },
  ],
  30: [
    {
      src: require('../assets/images/plans/Rothschild-23-01-plan-1978.jpg'),
      kind: 'plan',
      year: 1978,
      date: '13/4/1978',
      caption:
        "Original not digitised. Joseph Berlin's early-1920s drawings for Beit Golomb aren't on file; the oldest signed sheet is this 1978 museum-era permit — a later chapter, shown for want of the first.",
      source: HANDASA,
    },
  ],
  31: [
    {
      src: require('../assets/images/plans/Bialik-14-01-plan-1931.jpg'),
      kind: 'plan',
      year: 1931,
      date: '19/7/1931',
      caption:
        "Signed permit-plan, 19 Jul 1931 — Pinchas Bijonski's drawing for the Bialik Street house the painter Reuven Rubin would make his home and studio from 1946 (the permit dates it to 1931, a year after the usually-cited 1930).",
      source: HANDASA,
    },
  ],
  49: [
    {
      src: require('../assets/images/plans/Balfour-57-01-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '20/6/1933',
      caption:
        "Signed permit-plan, 20 Jun 1933 — the earliest of eighteen signed sheets, and the drawing that dates Karmi's building to 1933 where the municipal catalogue gave only a 1930–40 range.",
      source: HANDASA,
    },
  ],
  50: [
    {
      src: require('../assets/images/plans/Karl-Netter-9-02-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: 'undated (1937 or later)',
      caption:
        "Undated sheet (archive placeholder 1/1/1900; its committee stamp cites the 1937 by-law, so it is 1937 or later) for a flat on the roof, with the street elevation of the building's long front. Its title block names the architect of this addition as \u2018Eng. Y. A[?]gstein\u2019 (reading unclear: Arnstein / Ornstein / Argstein), of 42 Ahad Ha\u2019am. That is a later hand, not the unknown designer of the 1926 house.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Karl-Netter-9-01-plan-1927.jpg'),
      kind: 'plan',
      year: 1927,
      date: '1/12/1927',
      caption:
        "Signed permit-plan stamped 1 Dec 1927 — the documented entrance-stair alteration, a year after the 1926 house. Titled 'Beit Yosef Klein' and signed by the owner, not an architect: the designer stays unknown. The chamfered polygonal corner is already drawn in.",
      source: HANDASA,
    },
  ],
  1: [
    {
      src: require('../assets/images/plans/Rothschild-82-01-survey-1987.jpg'),
      kind: 'site',
      year: 1987,
      date: '1/11/1987',
      caption:
        "Original not digitised. Joseph & Ze'ev Berlin's 1932 permit drawings are not in the archive, and the secondary record (golden-lotus, project-tlv) holds photographs, not drawings — so this 1987 survey sheet is the oldest the archive keeps.",
      source: HANDASA,
    },
  ],
  2: [
    {
      src: require('../assets/images/plans/Rothschild-84-02-elevation-1933.jpg'),
      kind: 'elevation',
      year: 1933,
      date: '30/6/1933',
      caption:
        'Signed permit-elevation of 30 June 1933 — the same permit set as the 1933 plan, so it records the house as Rechter first drew it.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Rothschild-84-01-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '30/6/1933',
      caption:
        'Floor plans from the original building permit, 1933 — the year Ze’ev Rechter lifted the block onto its pilotis.',
      source: HANDASA,
    },
  ],
  3: [
    {
      src: require('../assets/images/plans/Nachmani-20-01-plan-1940.jpg'),
      kind: 'plan',
      year: 1940,
      date: '28/6/1940',
      caption:
        "Original not digitised. Alexander Levy's 1924–25 drawings aren't on file; the oldest sheet is this 1940 wartime plan reinforcing the basement into a shelter — a later chapter, shown for want of the first.",
      source: HANDASA,
    },
  ],
  25: [
    {
      src: require('../assets/images/plans/HaCarmel-58-01-plan.jpg'),
      kind: 'site',
      year: 0,
      date: 'undated',
      caption:
        "Original not digitised. Alexander Levy's 1922 drawings aren't on file (Handasa 00030020, Gush 6918/1); the only digitised signed sheet is this undated later plan — an added mezzanine (יציע) in Mangel's butcher shop by the engineer Yaakov Shapira — which still shows the corner's site and shop layout.",
      source: HANDASA,
    },
  ],
  33: [
    {
      src: require('../assets/images/plans/Mazeh-27-02-plan-1932.jpg'),
      kind: 'plan',
      year: 1932,
      date: '28/1/1932',
      caption:
        'Signed permit-plan of 28 Jan 1932, from the same permit set as the 1932 elevation.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Mazeh-27-01-elevation-1932.jpg'),
      kind: 'elevation',
      year: 1932,
      date: '28/1/1932',
      caption:
        "The front elevation from the original permit, signed 28 January 1932 — Joseph Berlin and his son Ze'ev's modern façade, its full-height glazed stairwell running up the centre (Handasa 00140270, Gush 7435/6).",
      source: HANDASA,
    },
  ],
  29: [
    {
      src: require('../assets/images/plans/Rothschild-16-03-elevation-1930.jpg'),
      kind: 'elevation',
      year: 1930,
      date: '27/3/1930',
      caption:
        "Signed permit-elevation of 27 March 1930 — Dizengoff's house at the start of its 1930s remaking, two decades after the 1910 house.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Rothschild-16-01-section-1933.jpg'),
      kind: 'section',
      year: 1933,
      date: '10/9/1933',
      caption:
        "The cross-section for the rooms added on the roof of 'the house of Mr. M. Dizengoff', signed 10 September 1933 (permit 806) — the two original floors in pencil below, the new roof room drawn in colour with its timber truss (yellow) and new columns (red). The 1933 extension made visible (Handasa 00080160).",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Rothschild-16-02-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '10/9/1933',
      caption:
        "The companion room-plan from the same 1933 permit — the new rooms inked in red over the existing house, dimensioned, the building's 76 m² footprint and block walls noted (Handasa 00080160).",
      source: HANDASA,
    },
  ],
  43: [
    {
      src: require('../assets/images/plans/HaHashmonaim-85-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: '',
      caption:
        "The south elevation to HaHashmonaim Street from the conservation survey (Mester-Gal Architects) — the wheat-stalk reliefs running in vertical bands beneath each window of the Nadlers' bank, the mission carved into the front (Handasa 00690830).",
      source: HANDASA,
    },
  ],
  47: [
    {
      src: require('../assets/images/plans/Yehuda-Halevi-131-02-plan-1925.jpg'),
      kind: 'plan',
      year: 1925,
      date: '24/11/1925',
      caption:
        "Approved plan of 24 Nov 1925, the only signed sheet on file and from the house's own 1925–26 build.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Yehuda-Halevi-131-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: '',
      caption:
        "The original Yehuda Halevi façade of the 'Common House', drawn in ink and wash at 1:100 for Ḥevrat HaBinyan HaMeshutaf — a symmetrical Art Deco front with a full-height glazed stair bay under a stepped cap, projecting balconied bays and a rusticated base (Handasa 00061310, preserved conservation copy).",
      source: HANDASA,
    },
  ],
  46: [
    {
      src: require('../assets/images/plans/Yehuda-Halevi-123-02-plan-1936.jpg'),
      kind: 'plan',
      year: 1936,
      date: '6/2/1936',
      caption:
        "Signed permit-plan of 6 Feb 1936, during the house's 1935–37 construction.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Yehuda-Halevi-123-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: '',
      caption:
        "The west elevation (חזית מערבית, 1:100), a conservation measured drawing — the curved external stair tower, the glazed central stairwell and the stacked balcony bays of Zabrodsky & Blaks's White City block (Handasa 00061230).",
      source: HANDASA,
    },
  ],
  20: [
    {
      src: require('../assets/images/plans/Zamenhof-1-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: '',
      caption:
        "The Dizengoff Square elevation (חזית כיכר דיזנגוף), scale 1:100 — a conservation measured drawing of Magidovitch's curved International-Style front, its continuous balcony bands wrapping the circle above the shopfront line (Handasa 01890010).",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Zamenhof-1-02-plan.jpg'),
      kind: 'plan',
      year: 0,
      date: '',
      caption:
        "A typical upper-floor plan (תבנית קומה א, 1:100) — the wedge-shaped hotel floor with rooms fanning around the curved square frontage, a central hall and the round stair drum (Handasa 01890010).",
      source: HANDASA,
    },
  ],
  19: [
    {
      src: require('../assets/images/plans/Idelson-29-01-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: '',
      caption:
        "The south elevation to Idelson Street (חזית דרומית — רחוב אידלסון), a measured conservation drawing of Dov Karmi's 1936 façade — the taut three-storey International-Style front with its banded windows and level datums (Handasa 01090290).",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/liebling-house-01-plan-1937.jpg'),
      kind: 'plan',
      year: 1937,
      date: '1937',
      caption:
        "The Liebling House typical floor plan, 1937 — the apartment layout of Dov Karmi's building, titled on the sheet 'Apartment building of Mr. L., Tel-Aviv'.",
      source: EXHIBITION,
    },
  ],
  38: [
    {
      src: require('../assets/images/plans/Geula-44-01-elevation-1924.jpg'),
      kind: 'elevation',
      year: 1924,
      date: '1924',
      caption:
        "The original Geula Street elevation, signed by Alexander Levy and titled 'Beit Lifshitz', scale 1:100 — the symmetric eclectic front with its crenellated parapet, corner turrets and carved frieze band (Handasa 01120440, preserved conservation copy).",
      source: HANDASA,
    },
  ],
  45: [
    {
      src: require('../assets/images/plans/Yehuda-Halevi-97-02-plan-1932.jpg'),
      kind: 'plan',
      year: 1932,
      date: '20/10/1932',
      caption:
        'Signed permit-plan stamped 20 Oct 1932, from the original permit set for the corner house on Yehuda Halevi and Mazeh, alongside the 1932 elevation.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Yehuda-Halevi-97-01-elevation-1932.jpg'),
      kind: 'elevation',
      year: 1932,
      date: '20/10/1932',
      caption:
        "The corner elevation from the original permit, stamped 20 October 1932 — Cherner's triangular stairwell rising to its full-height 'thermometer' window at the Yehuda Halevi–Mazeh junction (Handasa 00060970, Gush 7455/26).",
      source: HANDASA,
    },
  ],
  51: [
    {
      src: require('../assets/images/plans/Yehuda-Halevi-58-01-elevation-1934.jpg'),
      kind: 'elevation',
      year: 1934,
      date: '30/6/1934',
      caption:
        "The street elevation from the original permit, 1934 — Cherner's slim, ship-like modernist volume with its wrapping balconies on the three-street corner (Handasa 00060580, Gush 6936/189).",
      source: HANDASA,
    },
  ],
  22: [
    {
      src: require('../assets/images/plans/Nachmani-43-01-plan.jpg'),
      kind: 'plan',
      year: 0,
      date: 'undated',
      caption:
        "Original not digitised. Joseph Berlin's 1924 drawings for the Łódź textile works aren't on file (Handasa 00560430, Gush 6941/117); the fuller sheet is this later floor plan of the long factory hall, by the architects Barzilai & Haussmann — the earlier 1930 sheet on file is only a site plan of the plots.",
      source: HANDASA,
    },
  ],
  26: [
    {
      src: require('../assets/images/plans/Rothschild-46-01-plan-1994.jpg'),
      kind: 'plan',
      year: 1994,
      date: '14/6/1994',
      caption:
        "Original not digitised. Magidovitch's 1924 drawings aren't on file; the oldest sheet is this 1994 conservation measured-drawing set, made when the mansion was restored and tied into the Alrov Tower behind it (Handasa 00080460, Gush 7456/15).",
      source: HANDASA,
    },
  ],
  8: [
    {
      src: require('../assets/images/plans/Mazeh-16-01-elevation-1932.jpg'),
      kind: 'elevation',
      year: 1932,
      date: '9/2/1932',
      caption:
        'Front elevation, 9 Feb 1932 — David Tobia’s permit drawing for the house he built as his own home and office, a year before completion.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Mazeh-16-02-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '31/3/1933',
      caption: 'Floor plan from the same permit, 1933 — the layout behind that elevation.',
      source: HANDASA,
    },
  ],
  9: [
    {
      src: require('../assets/images/plans/Allenby-46-01-plan-1930.jpg'),
      kind: 'plan',
      year: 1930,
      date: '21/3/1930',
      caption:
        'Floor plan from permit 153, 21 Mar 1930 — the original drawing, matching the build year exactly.',
      source: HANDASA,
    },
  ],
  10: [
    {
      src: require('../assets/images/plans/Rothschild-83-01-plan-1929.jpg'),
      kind: 'plan',
      year: 1929,
      date: '28/2/1929',
      caption:
        "Ground-floor plan from the original permit 68, 28 Feb 1929 — the house Joseph Berlin drew for himself. The third floor came six years later, on a separate 1935 permit by his son Ze'ev.",
      source: HANDASA,
    },
  ],
  14: [
    {
      src: require('../assets/images/plans/Rothschild-64-01-plan-1930.jpg'),
      kind: 'plan',
      year: 1930,
      date: '4/7/1930',
      caption:
        'Floor plan, 4 Jul 1930 — the earliest digitised sheet. The building is recorded as 1926, so this is likely a slightly later addition, or the recorded year needs rechecking (open question).',
      source: HANDASA,
    },
  ],
  15: [
    {
      src: require('../assets/images/plans/Nachmani-23-01-plan-1925.jpg'),
      kind: 'plan',
      year: 1925,
      date: '15/10/1925',
      caption:
        'Floor plan, 15 Oct 1925 — Moshe Cherner’s original, drawn the build year. The building lives on today as the Norman Hotel.',
      source: HANDASA,
    },
  ],
  34: [
    {
      src: require('../assets/images/plans/Ahad-Haam-57-01-elevation-1931.jpg'),
      kind: 'elevation',
      year: 1931,
      date: '12/2/1931',
      caption:
        "Front elevation signed off 12 Feb 1931 — the permit drawing, two years ahead of the 1933 completion. Averbuch's plain modernist face, titled 'Beit Shilman, 57 Ahad Ha'am'.",
      source: HANDASA,
    },
  ],
  28: [
    {
      src: require('../assets/images/plans/Allenby-51-02-elevation.jpg'),
      kind: 'elevation',
      year: 0,
      date: 'undated (archive 1/1/1900)',
      caption:
        "Undated elevation (archive placeholder 1/1/1900), titled on the sheet 'Beit HaAhim Gottgold, Allenby Street corner Sheinkin Street, Tel Aviv': the Sheinkin-side face drawn flat, with the shop ground floor, stacked balcony bands and the roof frame that the curved corner wraps today.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Allenby-51-01-plan-1931.jpg'),
      kind: 'plan',
      year: 1931,
      date: '20/2/1931',
      caption:
        "Signed permit-plan, 20 Feb 1931 — the earliest of eleven signed sheets. It sits a few years before the building's recorded 1935 date, so either the recorded year needs revisiting or this permit belongs to an earlier phase on the plot (open question).",
      source: HANDASA,
    },
  ],
  17: [
    {
      src: require('../assets/images/plans/Allenby-110-01-plan-1934.jpg'),
      kind: 'plan',
      year: 1934,
      date: '13/2/1934',
      caption:
        "The only signed sheet on file — a permit-plan of 13 Feb 1934, a few years after the Great Synagogue's 1922–26 construction, so a later alteration rather than Magidovitch's original drawing.",
      source: HANDASA,
    },
  ],
  39: [
    {
      src: require('../assets/images/plans/Sheinkin-55-01-plan-1932.jpg'),
      kind: 'plan',
      year: 1932,
      date: '28/1/1932',
      caption:
        'Signed permit-plan, 28 Jan 1932 (permit 90, plan 66) — the original \'building of the house of Mr M. A. Kahana and his wife\', which finally dates this once-undated corner. The plan author signs in Latin script; the signature is not yet legible, so the architect stays unattributed.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Sheinkin-55-01-elevation-1932.jpg'),
      kind: 'elevation',
      year: 1932,
      date: '27/12/1932',
      caption:
        "The Sheinkin-Street elevation (with section and plan) from the December 1932 sheet — the 'addition of a building to the house of Mrs. Rivka Kahana,' municipal permit 134, plan 4104.",
      source: HANDASA,
    },
  ],
  36: [
    {
      src: require('../assets/images/plans/Ahad-Haam-92-01-plan-1930.jpg'),
      kind: 'plan',
      year: 1930,
      date: '17/3/1930',
      caption:
        "Signed permit-plan, 17 Mar 1930 — the earliest sheet on file, close on the heels of Moshe Cherner's ~1928 house at 92 Ahad Ha'am.",
      source: HANDASA,
    },
  ],
  35: [
    {
      src: require('../assets/images/plans/Ahad-Haam-84-01-plan-1934.jpg'),
      kind: 'plan',
      year: 1934,
      date: '3/3/1934',
      caption:
        "Original not digitised. The earliest dated signed sheet on file is this permit-plan of 3 Mar 1934 — a decade after Joseph Berlin's 1924 house, so a later alteration. Three undated scans in the file may hold the original drawings.",
      source: HANDASA,
    },
  ],
  37: [
    {
      src: require('../assets/images/plans/Allenby-48-01-plan-1937.jpg'),
      kind: 'plan',
      year: 1937,
      date: '8/8/1937',
      caption:
        "Original not digitised. The earliest signed sheet on file is this alteration permit (no. 754, 8 Aug 1937), which draws the plot, the *existing* building (marked בנין קיים) and a small street elevation — placing the house well before it, consistent with the ~1925 date and the unsettled attribution.",
      source: HANDASA,
    },
  ],
  16: [
    {
      src: require('../assets/images/plans/Mazeh-38-01-plan-1933.jpg'),
      kind: 'plan',
      year: 1933,
      date: '25/6/1933',
      caption:
        "Floor plan from the June 1933 permit set — the fan-shaped footprint that earns the name Beit HaMenifa, 'the Fan House.' A later 1940 permit once muddied the dating; this 1933 set confirms the build.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Mazeh-38-02-elevation-1933.jpg'),
      kind: 'elevation',
      year: 1933,
      date: '25/6/1933',
      caption: 'Front elevation from the same 1933 permit set — the street face of the Fan House.',
      source: HANDASA,
    },
  ],
  53: [
    {
      src: require('../assets/images/plans/Bialik-23-02-plan-1930.jpg'),
      kind: 'plan',
      year: 1930,
      date: '18/3/1930',
      caption:
        'Signed permit-plan stamped 18 March 1930 — a later permit, some four years after the 1925–26 house; the original drawings are not digitised.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Bialik-23-01-section-1930.jpg'),
      kind: 'section',
      year: 1930,
      date: '18/3/1930',
      caption:
        "Original plan not digitised. The oldest sheet on file is this 1930 staircase section (municipal stamp 18 Mar 1930, permit 145), titled for 'the building of Mr. Shmuel Balder, Bialik 23' — apt for the house that grew: the stair of the floors added a few years after the one-storey villa. (The archive index mis-dates it 1939.)",
      source: HANDASA,
    },
  ],
  59: [
    {
      src: require('../assets/images/plans/Rambam-26-02-elevation-1931.jpg'),
      kind: 'elevation',
      year: 1931,
      date: '12/10/1931',
      caption:
        'Signed permit-elevation of 12 Oct 1931 — from the original permit set, alongside the 1931 plan.',
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Rambam-26-01-plan-1931.jpg'),
      kind: 'plan',
      year: 1931,
      date: '12/10/1931',
      caption:
        "The original signed permit drawing — Magidovitch's 1931 floor plan for the Nathaniel corner, its title block naming Allenby 82 / Rambam 26 and the municipal stamp reading 12 Oct 1931 (permit 895). The angular corner and the stair core read straight off the sheet.",
      source: HANDASA,
    },
  ],
  63: [
    {
      src: require('../assets/images/plans/Allenby-79-02-plan-1930.jpg'),
      kind: 'plan',
      year: 1930,
      date: '23/3/1930',
      caption:
        "Signed permit-plan of 23 March 1930 — the closing stage of the building's 1922–30 construction.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Allenby-79-01-elevation-1925.jpg'),
      kind: 'elevation',
      year: 1925,
      date: '16/12/1925',
      caption:
        "The original 1925 façade — titled 'the house of Mr. S. David,' signed off under permit 1059. Tabachnik's Jewish-Jugendstil front: a crenellated parapet, arched windows on twisted colonettes, an Art-Nouveau entrance.",
      source: HANDASA,
    },
  ],
  70: [
    {
      src: require('../assets/images/plans/70-balfour-4-elevation-reconstructed-1922.jpg'),
      kind: 'elevation',
      year: 1922,
      date: '1922 (reconstructed 2021)',
      caption:
        "No original drawing of Beit Alfes was ever filed. This is the conservation team's reconstruction of the 1922 street elevation — the symmetrical Eclectic front with its pointed-arch loggias, central arched entrance and crenellated parapet — read back from the standing building, a 1934 alteration permit and historic photographs (Shifman / RixArc documentation file, 2021).",
      source: 'Tel Aviv municipal conservation documentation file (Anna Shifman / Hadas Riks, RixArc, June 2021); building file, Handasa engineering archive',
    },
  ],
  64: [
    {
      src: require('../assets/images/plans/Melchett-3-02-elevation-1932.jpg'),
      kind: 'elevation',
      year: 1932,
      date: '31/7/1932',
      caption:
        "Signed permit-elevation (with plan) of 31 July 1932 — the north wing's original permit set.",
      source: HANDASA,
    },
    {
      src: require('../assets/images/plans/Melchett-3-01-plan-1932.jpg'),
      kind: 'plan',
      year: 1932,
      date: '31/7/1932',
      caption:
        "The 1932 permit sheet for 'the house of Mr. Israel Kimball' at the Mazeh–Melchett corner — floor plan, section and site plan (plan 1929, approved 31 July 1932).",
      source: HANDASA,
    },
  ],
};

/** Archival drawings for this building, in chronological order (empty if none held). */
export function plansForBuilding(id: number): Plan[] {
  return plansFor[id] ?? [];
}
