/** Rough zoom-level -> region-delta conversion for react-native-maps. */
export function zoomToDelta(zoom: number): { latitudeDelta: number; longitudeDelta: number } {
  const longitudeDelta = 360 / 2 ** zoom;
  return { latitudeDelta: longitudeDelta, longitudeDelta };
}
