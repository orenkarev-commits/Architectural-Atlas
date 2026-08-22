import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii } from '../theme/tokens';

export function GlassCard({
  children,
  style,
  onPress,
  strong = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Higher-alpha fill, used on Field research's Stories cards. */
  strong?: boolean;
}) {
  const content = (
    <View style={[styles.base, strong && styles.strong, style]}>{children}</View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.xl,
  },
  strong: {
    backgroundColor: colors.glassFillStrong,
  },
  pressed: {
    transform: [{ translateY: -2 }],
    opacity: 0.96,
  },
});
