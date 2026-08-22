const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/**
 * Initial great-circle bearing from `a` to `b`, in degrees clockwise from north
 * (0 = north, 90 = east). Used to aim the compass needle on the architect page
 * at the nearest building — the dial is treated as north-up (no magnetometer).
 */
export function bearingDeg(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
