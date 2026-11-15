import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Building } from '../data/types';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

export function BuildingRow({
  building,
  distanceKm,
  onPress,
}: {
  building: Building;
  distanceKm?: number;
  onPress: () => void;
}) {
  const metaLine = distanceKm != null
    ? `${building.year} · ${building.style} · ${distanceKm.toFixed(1)} km`
    : `${building.year} · ${building.style}`;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={building.image} style={styles.thumb} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {building.name}
        </Text>
        <Text style={styles.meta}>{metaLine}</Text>
        <Text style={styles.architect} numberOfLines={1}>
          {building.architect}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.lg,
    padding: 11,
    gap: spacing.lg,
  },
  pressed: {
    transform: [{ translateY: -2 }],
  },
  thumb: {
    width: 56,
    height: 70,
    borderRadius: radii.xs,
  },
  text: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    ...editorial.cardTitle,
    color: colors.inkSoft,
  },
  meta: {
    ...ui.metadataSmall,
    color: colors.muted,
  },
  architect: {
    ...ui.metadataSmall,
    color: colors.mutedLight,
  },
});
