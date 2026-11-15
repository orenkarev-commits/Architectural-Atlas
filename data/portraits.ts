import type { ImageSourcePropType } from 'react-native';

/**
 * Architect portraits, keyed by the exact `Architect.name`. Sourced from Hebrew
 * Wikipedia and each **visually verified** to depict the right person (Levy's is a
 * captioned 1927 self-portrait; the others are period portraits from the matching
 * article). Licences to confirm per file before any public release — see the vault
 * "Photo Credits". Lotte Cohn's is a public-domain period portrait from Wikimedia
 * Commons (File:Lotte_Cohn.jpg). Pinhas Hütt's and Carl Rubin's portraits are period
 * black-and-white photographs supplied by the project owner (identification per owner;
 * licence to confirm before public release). David Tobia, Joseph Minor and the other
 * 2026 batch architects (Balder, the Friedmans) still have no verified portrait —
 * their Wikipedia lead images are of buildings, not the person.
 */
const portraits: Partial<Record<string, ImageSourcePropType>> = {
  'Joseph Berlin': require('../assets/images/architects/joseph-berlin.jpg'),
  'Lotte Cohn': require('../assets/images/architects/lotte-cohn.jpg'),
  "Ze'ev Rechter": require('../assets/images/architects/zeev-rechter.jpg'),
  'Dov Karmi': require('../assets/images/architects/dov-karmi.jpg'),
  'Alexander Levy': require('../assets/images/architects/alexander-levy.jpg'),
  'Moshe Cherner': require('../assets/images/architects/moshe-cherner.jpg'),
  'Zaki Chelouche': require('../assets/images/architects/zaki-chelouche.jpg'),
  'Yehuda Magidovitch': require('../assets/images/architects/yehuda-magidovitch.jpg'),
  'Genia Averbuch': require('../assets/images/architects/Genia_Averbuch.jpg'),
  'Pinhas Hütt': require('../assets/images/architects/pinhas-hutt.jpg'),
  'Carl Rubin': require('../assets/images/architects/carl-rubin.jpg'),
};

/** Verified portrait for this architect, or null (show a monogram instead). */
export function portraitFor(name: string): ImageSourcePropType | null {
  return portraits[name] ?? null;
}
