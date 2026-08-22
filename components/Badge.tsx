import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { ui } from '../theme/typography';

type Variant = 'style' | 'year' | 'note' | 'school';

export function Badge({
  label,
  variant = 'year',
  onPress,
}: {
  label: string;
  variant?: Variant;
  onPress?: () => void;
}) {
  const content = (
    <Text style={[styles.text, variant === 'style' && styles.styleText, variant === 'school' && styles.styleText]}>
      {label}
    </Text>
  );

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.badge,
        variant === 'style' && styles.styleBadge,
        variant === 'year' && styles.yearBadge,
        variant === 'note' && styles.noteBadge,
        variant === 'school' && styles.styleBadge,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.md,
    paddingVertical: 5,
    paddingHorizontal: spacing.base,
    alignSelf: 'flex-start',
  },
  styleBadge: {
    backgroundColor: colors.terracottaTint,
  },
  yearBadge: {
    backgroundColor: colors.neutralBadge,
  },
  noteBadge: {
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: 'transparent',
  },
  text: {
    ...ui.metadataSmall,
    color: colors.muted,
  },
  styleText: {
    color: colors.terracottaTextOnTint,
  },
});
