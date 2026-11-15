import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../theme/tokens';

export function BackButton({ style, onPress }: { style?: object; onPress?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      style={({ pressed }) => [styles.button, { top: insets.top + 8 }, pressed && styles.pressed, style]}
    >
      <Text style={styles.chevron}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 18,
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
  pressed: {
    transform: [{ scale: 1.05 }],
  },
  chevron: {
    fontSize: 22,
    color: colors.ink,
    marginRight: 2,
  },
});
