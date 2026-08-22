import { zoomToDelta } from './mapZoom';

/**
 * The Atlas stores coordinates as `{ lat, lng }` (matching the vault's
 * frontmatter and the original design data). react-native-maps expects
 * `{ latitude, longitude }`. Convert at the map boundary — never store the
 * react-native-maps shape in `data/`.
 */
export interface LatLngPair {
  lat: number;
  lng: number;
}

export function toLatLng(p: LatLngPair): { latitude: number; longitude: number } {
  return { latitude: p.lat, longitude: p.lng };
}

export function toRegion(p: LatLngPair, zoom: number) {
  return { ...toLatLng(p), ...zoomToDelta(zoom) };
}
