import { useFonts } from '@expo-google-fonts/madimi-one';
import { MadimiOne_400Regular } from '@expo-google-fonts/madimi-one';
import {
  Comfortaa_300Light,
  Comfortaa_400Regular,
  Comfortaa_500Medium,
  Comfortaa_600SemiBold,
  Comfortaa_700Bold,
} from '@expo-google-fonts/comfortaa';

// Two families: Madimi One (a rounded display face) for titles, Comfortaa for
// every subtitle and body run.
export function useAtlasFonts() {
  const [loaded] = useFonts({
    MadimiOne_400Regular,
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
  });
  return loaded;
}
