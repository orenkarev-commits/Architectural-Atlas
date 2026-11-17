import type { ImageSourcePropType } from 'react-native';

/**
 * Building photography, keyed by building id.
 *
 * Metro requires static `require()` calls, so each photograph is listed
 * explicitly rather than resolved from a path at runtime. To add one:
 *
 *   1. drop the file in `assets/images/buildings/<slug>.jpg`
 *   2. add a line below
 *
 * Nothing in `buildings.ts` needs to change — it reads through `photoFor()`.
 * Buildings with no entry fall back to the shared placeholder, which is why
 * the Atlas still renders while nine of ten photographs are outstanding
 * (NOTES.md, open item #2).
 */

export const placeholder: ImageSourcePropType = require('../assets/images/placeholder-building.png');

const photos: Partial<Record<number, ImageSourcePropType>> = {
  // Façade photographs via Hebrew Wikipedia / Wikimedia Commons — each visually
  // verified to depict the right building. Licences (mostly CC BY-SA) to confirm
  // per file before any public release; see Open Items. Attribution in the vault
  // "App/Photo Credits" note.
  // Real photographs taken by the researcher (highest confidence).
  1: require('../assets/images/buildings/1-Brown-Rabinsky-House.jpeg'),
  5: require('../assets/images/buildings/5-water-tower.jpg'),
  9: require('../assets/images/buildings/9-beit-mann.jpeg'),
  28: require('../assets/images/buildings/28-beit-gottgold.jpeg'),
  8: require('../assets/images/buildings/8-mazeh-16.jpg'),
  16: require('../assets/images/buildings/16-beit-brown.jpg'),
  33: require('../assets/images/buildings/33-elishav-house.jpg'),
  37: require('../assets/images/buildings/37-Beit-Tzemach-Shkanovsky.jpeg'),
  38: require('../assets/images/buildings/38-beit-lifshitz.jpeg'),
  40: require('../assets/images/buildings/40-Roland-Neef-House.jpeg'),
  41: require('../assets/images/buildings/41-Albrecht-Aberle-House.jpeg'),
  42: require('../assets/images/buildings/42-Eugine-Steller-House.jpeg'),
  2: require('../assets/images/buildings/2-engel-house.jpg'),
  3: require('../assets/images/buildings/3-pagoda-house.jpg'),
  4: require('../assets/images/buildings/4-beit-bialik.jpg'),
  21: require('../assets/images/buildings/21-beit-hakadim.jpg'),
  // The "בית ברלין-פסובסקי" article image depicts Beit HaTe'omim (user-confirmed),
  // not Berlin House — Berlin House now has its own photo (id 10, above).
  11: require('../assets/images/buildings/11-beit-hateomim.jpg'),
  17: require('../assets/images/buildings/17-great-synagogue.jpg'),
  18: require('../assets/images/buildings/18-dizengoff-square.jpg'),
  19: require('../assets/images/buildings/19-liebling-house.jpeg'),
  // Web-sourced, each visually verified against its subject before use.
  12: require('../assets/images/buildings/12-power-station.jpg'),
  13: require('../assets/images/buildings/13-ohel-moed.jpg'),
  22: require('../assets/images/buildings/22-lodzia-house.jpg'),
  26: require('../assets/images/buildings/26-levin-house.jpg'),
  27: require('../assets/images/buildings/27-ben-gurion-house.jpg'),
  29: require('../assets/images/buildings/29-independence-hall.jpg'),
  30: require('../assets/images/buildings/30-haganah-museum.jpeg'),
  32: require('../assets/images/buildings/32-beit-hair.jpg'),
  // Real field photograph supplied in the Balfour 57 intake (embedded data URI).
  49: require('../assets/images/buildings/49-balfour-57.jpeg'),
  // Real field photographs (user, 14 Aug 2026 — Field_Photos folder, High confidence).
  43: require('../assets/images/buildings/43-agricultural-bank.jpeg'),
  44: require('../assets/images/buildings/44-templer-reservoir.jpeg'),
  45: require('../assets/images/buildings/45-hemphel-house.jpg'),
  46: require('../assets/images/buildings/46-fruma-gourevitz-house.jpeg'),
  // 47: AI restoration (Google Flow, Nano Banana 2.1, 2026-11-16) of Oren's own photo, an illustration rather than a record. Original kept as 47-nastissin-house-original.jpeg.
  47: require('../assets/images/buildings/47-nastissin-house.jpeg'),
  48: require('../assets/images/buildings/48-turret-building.jpeg'),
  50: require('../assets/images/buildings/50-beit-klein.jpeg'),
  51: require('../assets/images/buildings/51-beit-yerdani.jpeg'),
  52: require('../assets/images/buildings/52-balfour-42.jpeg'),
  // Newly wired building photographs.
  7: require('../assets/images/buildings/7-Moshe-Greidinger-House.jpeg'),
  25: require('../assets/images/buildings/25-Beit-Mangel.jpg'),
  10: require('../assets/images/buildings/10-Berlin-House.jpg'),
  14: require('../assets/images/buildings/14-Beit-Awad.jpeg'),
  // id 15 renamed Beit Romanov -> Beit Shafran (naming correction, 2026-08-29).
  // Image shows the Norman Hotel entrance — the merged Shafran + Romanov compound;
  // a dedicated shot of the King Albert Square / Melchett elevation is still wanted.
  15: require('../assets/images/buildings/15-Beit-Shafran.jpg'),
  20: require('../assets/images/buildings/20-Cinema-Esther.jpg'),
  31: require('../assets/images/buildings/31-Rubin-Museum.jpeg'),
  35: require('../assets/images/buildings/35-Guter-House.jpeg'),
  // New building photographs (batch 53–58), wired 2026-08-29 — filename id matches project id.
  53: require('../assets/images/buildings/53-Beit-Balder.jpeg'),
  54: require('../assets/images/buildings/54-Beit-Peltzman.jpeg'),
  55: require('../assets/images/buildings/55-Beit-Hava-Shapira.jpeg'),
  56: require('../assets/images/buildings/56-Beit-Zlocisti.jpeg'),
  57: require('../assets/images/buildings/57-Beit-Gross.jpeg'),
  58: require('../assets/images/buildings/58-Beit-Hazin.jpg'),
  63: require('../assets/images/buildings/63-Beit-Shmuel-David.jpg'),
  67: require('../assets/images/buildings/67-Beit Victor Nagi.jpeg'),
  68: require('../assets/images/buildings/68-Ahad Haam School.jpeg'),
  // Historic 1922 photograph of the finished building, from Alexander Levy's estate
  // papers (Zionist Archive), annotated in his hand in German — via the municipal
  // conservation documentation file (Shifman/RixArc, 2021).
  70: require('../assets/images/buildings/70-beit-alfes.jpg'),
};

/** Real photograph for this building if one exists, otherwise the placeholder. */
export function photoFor(
  id: number,
  fallback: ImageSourcePropType = placeholder
): ImageSourcePropType {
  return photos[id] ?? fallback;
}

/** True when this building still has no real photograph. */
export function isPlaceholder(id: number): boolean {
  return photos[id] === undefined;
}
