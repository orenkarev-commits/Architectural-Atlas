import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GradientBackground } from '../../components/GradientBackground';
import { BackButton } from '../../components/BackButton';
import { GlassCard } from '../../components/GlassCard';
import { stories } from '../../data/stories';
import { buildings } from '../../data/buildings';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

interface StoryView {
  tag: string;
  title: string;
  place: string;
  reveal: string;
  slotHint: string;
  buildingId: number;
  buildingName: string;
}

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  let view: StoryView | undefined;
  const story = stories.find((s) => s.id === id);
  if (story) {
    view = {
      tag: story.tag,
      title: story.title,
      place: story.place,
      reveal: story.reveal,
      slotHint: story.slotHint,
      buildingId: story.buildingId,
      buildingName: story.buildingName,
    };
  } else {
    // Building-derived story (id `b<buildingId>`): draw the story from the
    // building's own "why it matters" prose so every card opens a story.
    const bid = Number(String(id ?? '').replace(/^b/, ''));
    const b = buildings.find((x) => x.id === bid);
    if (b) {
      view = {
        tag: b.style,
        title: b.thread,
        place: `${b.name} · ${b.address}`,
        reveal: b.materials ? `${b.whyItMatters}\n\n${b.materials}` : b.whyItMatters,
        slotHint: b.name,
        buildingId: b.id,
        buildingName: b.name,
      };
    }
  }

  if (!view) return null;
  const v = view;

  return (
    <GradientBackground>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Story</Text>

        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{v.tag}</Text>
        </View>
        <Text style={styles.title}>{v.title}</Text>
        <Text style={styles.place}>{v.place}</Text>

        <View style={styles.illustrationPanel}>
          <Text style={styles.illustrationPlaceholder}>{v.slotHint} — illustration pending</Text>
        </View>

        <Text style={styles.reveal}>{v.reveal}</Text>

        <GlassCard
          strong
          style={styles.buildingButton}
          onPress={() =>
            router.push({ pathname: '/locating', params: { buildingId: String(v.buildingId) } })
          }
        >
          <Text style={styles.buildingLabel}>Building</Text>
          <Text style={styles.buildingName}>{v.buildingName}</Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  header: {
    ...ui.label,
    color: colors.muted,
    marginBottom: spacing.sm,
    // Sits beside the floating back button rather than under it.
    marginLeft: 46,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.terracottaTint,
    borderRadius: radii.md,
    paddingVertical: 5,
    paddingHorizontal: spacing.base,
  },
  tagText: {
    ...ui.label,
    color: colors.terracottaTextOnTint,
  },
  title: {
    ...editorial.storyTitle,
    color: colors.ink,
  },
  place: {
    ...ui.metadata,
    color: colors.muted,
  },
  illustrationPanel: {
    height: 250,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  illustrationPlaceholder: {
    ...ui.metadataSmall,
    color: colors.mutedLight,
    textAlign: 'center',
  },
  reveal: {
    ...ui.bodyLarge,
    lineHeight: 15 * 1.7,
    color: colors.body,
  },
  buildingButton: {
    padding: spacing.lg,
  },
  buildingLabel: {
    ...ui.label,
    color: colors.label,
  },
  buildingName: {
    ...editorial.cardTitleLg,
    fontSize: 17,
    color: colors.ink,
    marginTop: spacing.xs,
  },
});
