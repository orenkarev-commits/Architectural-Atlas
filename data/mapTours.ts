// Guided tours for the full-screen map, grouped into three categories:
//   Impact       — one tour per architect with 3+ Atlas buildings
//   Architecture — one tour per style (all buildings of that style)
//   History      — the founding-of-the-state route
// Stop orders are hand-tuned into a clean walking sequence (nearest-neighbour +
// 2-opt, which removes route crossings), not raw chronology.
export interface MapTour {
  key: string;
  name: string;
  subtitle: string;
  stopIds: number[];
}

export interface TourCategory {
  key: string;
  name: string;
  blurb: string;
  tours: MapTour[];
}

export const tourCategories: TourCategory[] = [
  {
    key: 'impact',
    name: 'Impact',
    blurb: 'By architect',
    tours: [
      { key: 'impact-berlin', name: 'Joseph Berlin', subtitle: '13 buildings', stopIds: [9, 11, 33, 35, 10, 1, 22, 14, 12, 13, 30, 55, 61] },
      { key: 'impact-cherner', name: 'Moshe Cherner', subtitle: '8 buildings', stopIds: [51, 45, 52, 36, 23, 15, 32, 64] },
      { key: 'impact-magidovitch', name: 'Yehuda Magidovitch', subtitle: '6 buildings', stopIds: [26, 17, 28, 20, 58, 59] },
      { key: 'impact-levy', name: 'Alexander Levy', subtitle: '4 buildings', stopIds: [3, 25, 38, 66] },
    ],
  },
  {
    key: 'architecture',
    name: 'Architecture',
    blurb: 'By style',
    tours: [
      { key: 'arch-ottoman', name: 'Ottoman Era', subtitle: '3 buildings', stopIds: [44, 48, 60] },
      { key: 'arch-eclectic', name: 'Eclectic', subtitle: '32 buildings', stopIds: [32, 4, 9, 37, 38, 25, 21, 11, 3, 15, 23, 7, 35, 36, 10, 22, 5, 13, 26, 50, 17, 30, 53, 55, 56, 57, 58, 62, 63, 65, 66, 68] },
      { key: 'arch-art-deco', name: 'Art Deco', subtitle: '5 buildings', stopIds: [12, 14, 47, 59, 61] },
      { key: 'arch-early-modernism', name: 'Early Modernism', subtitle: '2 buildings', stopIds: [49, 52] },
      { key: 'arch-international', name: 'International Style', subtitle: '23 buildings', stopIds: [27, 20, 18, 19, 28, 8, 29, 33, 16, 1, 45, 51, 2, 34, 31, 39, 46, 41, 40, 42, 54, 64, 67] },
    ],
  },
  {
    key: 'history',
    name: 'History',
    blurb: 'How the city lived',
    tours: [
      { key: 'history-founding', name: 'Founding of the State', subtitle: 'Drafted → defended → declared', stopIds: [27, 35, 5, 65, 68, 30, 29] },
      { key: 'theme-cafe-culture', name: 'Cafe Culture', subtitle: 'Where the young city gathered', stopIds: [51, 63, 58, 25, 38, 9, 69] },
    ],
  },
];

/** Flat lookup — every tour across all categories. */
export const allTours: MapTour[] = tourCategories.flatMap((c) => c.tours);

/**
 * Per-stop café detail for the Cafe Culture tour — shown on the map stepper
 * (café name · years · one line) before you open the full building page.
 */
export const cafeStops: Record<number, { cafe: string; years: string; note: string }> = {
  25: { cafe: 'Café Maadonim', years: 'from 1925', note: "Izbitski's confectionery-café, where Bialik and Ravnitzki held a table." },
  58: { cafe: 'Café Rafael', years: '1920s', note: "The address's best-known tenant — in the building where the painter Reuven Rubin held his wedding on the roof." },
  9: { cafe: "Fenigstein's café", years: '1930s–70s', note: 'The Warsaw émigré Baruch Fenigstein’s café next door — later a beer cellar of roast goose and sausage.' },
  63: { cafe: "Moshe Wald's coffee house", years: '1940s', note: "Famous for its sought-after ‘Balsam’ ice cream — beside Abraham Padlossov's restaurant on the Allenby ground floor." },
  38: { cafe: 'A grocery-turned-café', years: '20th c.', note: 'One of a century of cafés through the four ground-floor shops.' },
  51: { cafe: 'Ground-floor cafés', years: '20th c.', note: 'Cafés among the block’s ever-changing shops (names unrecorded).' },
  69: { cafe: 'Café Sapir → Café Bialik', years: '1932–2020s', note: 'Café Sapir opened on the roof in 1932 (Bialik & Dizengoff’s café); a century of coffee — Sapir, Zamir, Gan Raveh, Par, Café Bialik.' },
};
