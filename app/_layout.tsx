import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AtlasProvider } from '../context/AtlasContext';
import { HomeButton } from '../components/HomeButton';
import { SplashOverlay } from '../components/SplashOverlay';
import { useAtlasFonts } from '../theme/fonts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useAtlasFonts();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      // Hand the native splash off to our JS Nolli splash so there's no flash.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AtlasProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <HomeButton />
        {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
      </AtlasProvider>
    </SafeAreaProvider>
  );
}
