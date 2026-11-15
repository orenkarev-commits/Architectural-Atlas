// The exact Google Maps style array from the handoff README's "Google Maps
// configuration" section, applied to every map instance in the app. The warm
// cast is what makes the map feel part of the app rather than embedded in it.
// POI and transit are off deliberately — noise for this app. Road label icons
// off for the same reason. Street names stay.
export const mapStyle = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      { hue: '#ff6800' },
      { saturation: '20' },
      { lightness: '-8' },
      { gamma: '1.00' },
      { weight: '1.12' },
    ],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// Dark variant: same idea (warm cast, no POI/transit), on charcoal.
export const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#211B18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#B0A196' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#191412' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3A302A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14181C' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// react-native-maps equivalent of the web prototype's
// `disableDefaultUI: true, gestureHandling: 'greedy'`.
export const mapUiProps = {
  showsCompass: false,
  showsScale: false,
  showsMyLocationButton: false,
  toolbarEnabled: false,
  zoomControlEnabled: false,
  rotateEnabled: true,
  pitchEnabled: false,
};
