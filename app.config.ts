import type { ExpoConfig } from 'expo/config';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';

// Google Maps API keys are restricted by bundle id / SHA-1 fingerprint and are
// meant to ship inside the app binary — unlike a server secret, embedding it
// here is standard practice. It still lives in .env (gitignored), never in git.
const config: ExpoConfig = {
  name: 'Architectural Atlas',
  slug: 'architectural-atlas',
  scheme: 'architectural-atlas',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  icon: './assets/images/icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.architecturalatlas.app',
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
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
        // Native pre-splash: the Nolli plan on the warm ground, so the JS
        // splash (which adds the title + drift) takes over with no flash.
        backgroundColor: '#FBF4EA',
        image: './assets/images/nolli-tel-aviv.jpg',
        resizeMode: 'cover',
      },
    ],
  ],
  updates: {
    url: 'https://u.expo.dev/33a0e3e5-2070-42a2-9c11-631389b45365',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '33a0e3e5-2070-42a2-9c11-631389b45365',
    },
  },
};

export default config;
