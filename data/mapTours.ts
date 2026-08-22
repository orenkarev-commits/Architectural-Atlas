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
      { key: 'impact-berlin', name: 'Joseph Berlin', subtitle: '11 buildings', stopIds: [9, 11, 33, 35, 10, 1, 22, 14, 12, 13, 30] },
      { key: 'impact-cherner', name: 'Moshe Cherner', subtitle: '7 buildings', stopIds: [51, 45, 52, 36, 23, 15, 32] },
      { key: 'impact-karmi', name: 'Dov Karmi', subtitle: '4 buildings', stopIds: [24, 49, 6, 19] },
      { key: 'impact-magidovitch', name: 'Yehuda Magidovitch', subtitle: '4 buildings', stopIds: [26, 17, 28, 20] },
      { key: 'impact-levy', name: 'Alexander Levy', subtitle: '3 buildings', stopIds: [3, 25, 38] },
    ],
  },
  {
    key: 'architecture',
    name: 'Architecture',
    blurb: 'By style',
    tours: [
      { key: 'arch-ottoman', name: 'Ottoman Era', subtitle: '2 buildings', stopIds: [44, 48] },
      { key: 'arch-eclectic', name: 'Eclectic', subtitle: '23 buildings', stopIds: [32, 4, 31, 9, 37, 38, 25, 21, 11, 3, 15, 23, 7, 35, 36, 10, 22, 5, 13, 26, 50, 17, 30] },
      { key: 'arch-art-deco', name: 'Art Deco', subtitle: '3 buildings', stopIds: [12, 14, 47] },
      { key: 'arch-early-modernism', name: 'Early Modernism', subtitle: '2 buildings', stopIds: [49, 52] },
      { key: 'arch-international', name: 'International Style', subtitle: '21 buildings', stopIds: [27, 20, 18, 19, 28, 8, 29, 6, 33, 16, 1, 45, 51, 2, 34, 39, 46, 24, 41, 40, 42] },
    ],
  },
  {
    key: 'history',
    name: 'History',
    blurb: 'Founding of the State',
    tours: [
      { key: 'history-founding', name: 'Founding of the State', subtitle: 'Drafted → defended → declared', stopIds: [27, 35, 5, 30, 29] },
    ],
  },
];

/** Flat lookup — every tour across all categories. */
export const allTours: MapTour[] = tourCategories.flatMap((c) => c.tours);
