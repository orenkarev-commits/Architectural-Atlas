import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Architect } from '../data/types';
import { portraitFor } from '../data/portraits';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const monogram = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function ArchitectRow({
  architect,
  onPress,
  onHoverIn,
  onHoverOut,
  active = false,
}: {
  architect: Architect;
  onPress: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  active?: boolean;
}) {
  const portrait = portraitFor(architect.name);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}
    >
      {portrait ? (
        <Image source={portrait} style={styles.portrait} resizeMode="cover" />
      ) : (
        <View style={[styles.portrait, styles.monogram]}>
          <Text style={styles.monogramText}>{monogram(architect.name)}</Text>
        </View>
      )}
      <View style={styles.textCol}>
        <Text style={[styles.name, active && styles.nameActive]}>{architect.name}</Text>
        <Text style={styles.meta}>
          {architect.years} · {architect.school}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  portrait: {
    width: 46,
    height: 56,
    borderRadius: radii.xs,
    backgroundColor: colors.surfaceTint,
  },
  monogram: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    ...editorial.cardTitle,
    fontSize: 16,
    color: colors.muted,
  },
  textCol: {
    flex: 1,
  },
  pressed: {
    transform: [{ translateY: -2 }],
  },
  active: {
    backgroundColor: colors.surfaceTint,
  },
  name: {
    ...editorial.cardTitle,
    fontSize: 17,
    color: colors.inkSoft,
  },
  nameActive: {
    color: colors.terracotta,
  },
  meta: {
    ...ui.metadataSmall,
    color: colors.muted,
    marginTop: 3,
  },
});
