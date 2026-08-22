import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

export function StoryCard({
  tag,
  title,
  onPress,
  centered = false,
}: {
  tag: string;
  title: string;
  onPress: () => void;
  centered?: boolean;
}) {
  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={centered ? styles.centeredRow : undefined}>
        <Text style={[styles.tag, centered && styles.centeredText]}>{tag}</Text>
        <Text style={[styles.title, centered && styles.centeredText]}>{title}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  centeredRow: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  tag: {
    ...ui.label,
    fontSize: 9,
    color: colors.terracottaTextOnTint,
    marginBottom: spacing.xs,
  },
  title: {
    ...editorial.storyCardTitle,
    color: colors.inkSoft,
  },
});
