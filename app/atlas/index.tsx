import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { CircularOverviewMap } from '../../components/CircularOverviewMap';
import { BuildingRow } from '../../components/BuildingRow';
import { BuildingWaves, WhoBuiltWhatStyle } from '../../components/AtlasCharts';
import { buildings } from '../../data/buildings';
import type { Building } from '../../data/types';
import { timelineStyles } from '../../data/styles';
import { parseYear } from '../../lib/year';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sortYear = (b: Building) => {
  const y = parseYear(b.year);
  return y === 0 ? Infinity : y;
};

// The three knowledge pages, lined up under "All Buildings".
const KNOWLEDGE: { label: string; path: string }[] = [
  { label: 'Innovations', path: '/innovations' },
  { label: 'Materials', path: '/materials' },
  { label: 'Dictionary', path: '/dictionary' },
];

// A style → its Architecture tour on the main map (walks every building of that style).
const STYLE_TOUR: Record<string, string> = {
  'Ottoman Era': 'arch-ottoman',
  Eclectic: 'arch-eclectic',
  'Art Deco': 'arch-art-deco',
  'Early Modernism': 'arch-early-modernism',
  'International Style': 'arch-international',
};

export default function Atlas() {
  const { style: styleParam } = useLocalSearchParams<{ style?: string }>();
  const [showBuildings, setShowBuildings] = useState<boolean>(!!styleParam);

  const sorted = useMemo(() => [...buildings].sort((a, b) => sortYear(a) - sortYear(b)), []);

  const goToBuilding = (building: Building) => {
    router.push({ pathname: '/locating', params: { buildingId: String(building.id) } });
  };

  // Styles link to the main map — "see more buildings like this" as a guided walk.
  const styleToMap = (styleName?: string) => {
    const tour = styleName ? STYLE_TOUR[styleName] : undefined;
    router.push({ pathname: '/map', params: tour ? { tour } : {} });
  };

  const toggleBuildings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowBuildings((o) => !o);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Atlas</Text>

        <CircularOverviewMap buildings={buildings} frameBuildings={buildings} onSelect={goToBuilding} />

        {/* A clean column of title buttons: All Buildings leads, the knowledge pages follow. */}
        <View style={styles.stack}>
          <Pressable style={[styles.bubble, styles.bubbleLead]} onPress={toggleBuildings}>
            <Text style={[styles.bubbleText, styles.bubbleTextLead]}>All Buildings</Text>
            <Text style={[styles.chevron, showBuildings && styles.chevronOpen]}>⌄</Text>
          </Pressable>

          {showBuildings ? (
            <View style={styles.expanded}>
              <Text style={styles.byStyle}>By style — tap to see them on the map</Text>
              <View style={styles.chips}>
                <Pressable onPress={() => styleToMap()} style={styles.chip}>
                  <Text style={styles.chipText}>All</Text>
                </Pressable>
                {timelineStyles
                  .filter((s) => s.kind === 'style')
                  .map((s) => (
                    <Pressable key={s.name} onPress={() => styleToMap(s.name)} style={styles.chip}>
                      <Text style={styles.chipText}>{s.name}</Text>
                    </Pressable>
                  ))}
              </View>
              <View style={styles.rows}>
                {sorted.map((b) => (
                  <BuildingRow key={b.id} building={b} onPress={() => goToBuilding(b)} />
                ))}
              </View>
            </View>
          ) : null}

          {KNOWLEDGE.map((k) => (
            <Pressable key={k.label} style={styles.bubble} onPress={() => router.push(k.path as never)}>
              <Text style={styles.bubbleText}>{k.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Building waves</Text>
          <BuildingWaves />
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Who built what style</Text>
          <WhoBuiltWhatStyle />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  chartTitle: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.sm },
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  title: {
    ...editorial.screenHeader,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
    textAlign: 'center',
    paddingTop: 56,
    marginBottom: spacing.lg,
  },
  stack: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  bubble: {
    alignSelf: 'center',
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.terracotta,
    borderRadius: radii.circle,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  bubbleLead: {
    minWidth: 260,
    paddingVertical: spacing.lg,
  },
  bubbleText: { ...editorial.cardTitle, fontSize: 15, color: colors.terracotta },
  bubbleTextLead: { fontSize: 20, fontWeight: '700' },
  chevron: { ...ui.body, fontSize: 20, lineHeight: 20, color: colors.terracotta },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  expanded: {
    gap: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  byStyle: { ...ui.metadataSmall, color: colors.muted, textAlign: 'center' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceTint,
  },
  chipText: { ...editorial.cardTitle, fontSize: 14, color: colors.ink },
  rows: { gap: spacing.base },
});
