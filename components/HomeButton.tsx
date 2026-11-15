import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../theme/tokens';

/**
 * A global "home" affordance floating top-right on every screen, returning to the
 * welcome screen from anywhere. Hidden on the welcome screen itself and during the
 * Locating transition (where there is nowhere to go home from yet). Rendered once in
 * the root layout, so no screen has to add it.
 */
export function HomeButton() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/locating') return null;

  return (
    <Pressable
      onPress={() => router.navigate('/')}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { top: insets.top + 8 }, pressed && styles.pressed]}
    >
      {/* A minimal house glyph drawn from views — no icon font, matching the icon-free design. */}
      <View style={styles.roof} />
      <View style={styles.base} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 18,
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.chrome,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },
  pressed: { transform: [{ scale: 1.05 }] },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.ink,
  },
  base: {
    width: 11,
    height: 8,
    backgroundColor: colors.ink,
    marginTop: -1,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
});
