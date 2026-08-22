import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { ui } from '../theme/typography';

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    transform: [{ translateY: -2 }],
    opacity: 0.95,
  },
  label: {
    ...ui.buttonLabel,
    color: colors.white,
  },
});
