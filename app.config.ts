import type { ExpoConfig } from 'expo/config';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';

// Google Maps API keys are restricted by bundle id / SHA-1 fingerprint and are
// meant to ship inside the app binary — unlike a server secret, embedding it
// here is standard practice. It still lives in .env (gitignored), never in git.
const config: ExpoConfig = {
  name: 'Architectural Atlas',
  slug: 'architectural-atlas',
  owner: 'oren2026',
  scheme: 'architectural-atlas',
  version: '1.0.0',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/2639e838-5a8d-469e-b637-cfadd17a8225',
  },
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.architecturalatlas.app',
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.architecturalatlas.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#FBF4EA',
    },
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'The Architectural Atlas uses your location to show which Tel Aviv buildings are nearest you.',
      },
    ],
    'expo-dev-client',
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission:
          'The Architectural Atlas uses your camera to point at buildings and label them.',
      },
    ],
    [
      'expo-splash-screen',
      {
        // Solid warm ground natively — no image — so there's no small, unscaled
        // map before the app. The JS SplashOverlay draws the full Nolli drift +
        // title on top, bridging cleanly from this warm screen.
        backgroundColor: '#FBF4EA',
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '2639e838-5a8d-469e-b637-cfadd17a8225',
    },
  },
};

export default config;
