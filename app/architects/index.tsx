import React, { useMemo, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { MotionGradient } from '../../components/MotionGradient';
import { ArchitectRow } from '../../components/ArchitectRow';
import { CompassDial } from '../../components/CompassDial';
import { architects } from '../../data/architects';
import { buildings } from '../../data/buildings';
import { askFor, type AskArchitect } from '../../data/askArchitect';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Per-architect "Ask the architect": tap to reveal the question, tap again for the answer. */
function AskButton({ entry }: { entry: AskArchitect }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0 closed · 1 question · 2 answer
  const advance = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhase((p) => ((p + 1) % 3) as 0 | 1 | 2);
  };
  return (
    <Pressable style={styles.askBlock} onPress={advance}>
      <Text style={styles.askLabel}>Ask the architect</Text>
      {phase >= 1 ? (
        <Text style={styles.askQuestion}>{entry.question}</Text>
      ) : (
        <Text style={styles.askHint}>Tap to ask ⌄</Text>
      )}
      {phase === 2 ? (
        <>
          <Text style={styles.askAnswer}>“{entry.answer}”</Text>
          {entry.context || entry.date ? (
            <Text style={styles.askContext}>
              {entry.date ? entry.date + ' — ' : ''}
              {entry.context}
            </Text>
          ) : null}
        </>
      ) : phase === 1 ? (
        <Text style={styles.askHint}>Tap to reveal the answer ⌄</Text>
      ) : null}
    </Pressable>
  );
}

export default function ArchitectsIndex() {
  const [hovered, setHovered] = useState<string | null>(null);

  const compassBuildings = useMemo(() => {
    if (hovered) {
      const own = buildings.filter((b) => b.architect === hovered);
      if (own.length > 0) return own;
    }
    return buildings;
  }, [hovered]);

  return (
    <MotionGradient variant="warm" opacity={0.5}>
      <BackButton />
      <FlatList
        data={architects}
        keyExtractor={(item) => item.name}
        extraData={hovered}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Architects</Text>
            <View style={styles.compassWrap}>
              <CompassDial buildings={compassBuildings} showDistance={false} />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const entry = askFor(item.name);
          return (
            <View>
              <ArchitectRow
                architect={item}
                active={hovered === item.name}
                onHoverIn={() => setHovered(item.name)}
                onHoverOut={() => setHovered((h) => (h === item.name ? null : h))}
                onPress={() => router.push({ pathname: '/architects/[name]', params: { name: item.name } })}
              />
              {entry ? <AskButton entry={entry} /> : null}
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.base }} />}
      />
    </MotionGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  header: {
    paddingTop: 52,
    marginBottom: spacing.xxl,
  },
  title: {
    ...editorial.screenHeader,
    color: colors.ink,
    marginLeft: 46,
  },
  compassWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  askBlock: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 5,
    marginTop: spacing.sm,
    marginLeft: spacing.xxl,
  },
  askLabel: {
    // Poppins, uppercase — the button's own label.
    ...ui.label,
    color: 'rgba(255,255,255,0.8)',
  },
  askHint: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.72)',
  },
  askQuestion: {
    // Poppins (sans) — the question.
    ...ui.body,
    color: colors.white,
    marginTop: 2,
  },
  askAnswer: {
    // Newsreader italic (serif) — the architect's voice, a different typeface for legibility.
    ...editorial.cardTitleLg,
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.white,
    marginTop: spacing.xs,
  },
  askContext: {
    // Poppins, small — the explanation + date under the answer.
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 15,
    marginTop: spacing.sm,
  },
});
