import type { ImageSourcePropType } from 'react-native';

/**
 * Architect portraits, keyed by the exact `Architect.name`. Sourced from Hebrew
 * Wikipedia and each **visually verified** to depict the right person (Levy's is a
 * captioned 1927 self-portrait; the others are period portraits from the matching
 * article). Licences to confirm per file before any public release — see the vault
 * "Photo Credits". David Tobia and Joseph Minor have no verified portrait yet.
 */
const portraits: Partial<Record<string, ImageSourcePropType>> = {
  'Joseph Berlin': require('../assets/images/architects/joseph-berlin.jpg'),
  "Ze'ev Rechter": require('../assets/images/architects/zeev-rechter.jpg'),
  'Dov Karmi': require('../assets/images/architects/dov-karmi.jpg'),
  'Alexander Levy': require('../assets/images/architects/alexander-levy.jpg'),
  'Moshe Cherner': require('../assets/images/architects/moshe-cherner.jpg'),
  'Zaki Chelouche': require('../assets/images/architects/zaki-chelouche.jpg'),
  'Yehuda Magidovitch': require('../assets/images/architects/yehuda-magidovitch.jpg'),
  'Genia Averbuch': require('../assets/images/architects/Genia_Averbuch.jpg'),
};

/** Verified portrait for this architect, or null (show a monogram instead). */
export function portraitFor(name: string): ImageSourcePropType | null {
  return portraits[name] ?? null;
}
