import React, { useMemo, useState } from 'react';
import { Image, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { CircularOverviewMap } from '../../components/CircularOverviewMap';
import { BuildingRow } from '../../components/BuildingRow';
import { BuildingWaves, WhoBuiltWhatStyle } from '../../components/AtlasCharts';
import { buildings } from '../../data/buildings';
import { architects } from '../../data/architects';
import { portraitFor } from '../../data/portraits';
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

// A style → its Architecture tour on the main map (walks every building of that style).
const STYLE_TOUR: Record<string, string> = {
  'Ottoman Era': 'arch-ottoman',
  Eclectic: 'arch-eclectic',
  'Art Deco': 'arch-art-deco',
  'Early Modernism': 'arch-early-modernism',
  'International Style': 'arch-international',
};

/** Three line glyphs for the Atlas tiles. */
function TileGlyph({ kind, color }: { kind: 'buildings' | 'atlas' | 'stories'; color: string }) {
  const p = { stroke: color, strokeWidth: 1.7, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'buildings') {
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24">
        <Rect x={3} y={8} width={8} height={13} {...p} />
        <Rect x={13} y={4} width={8} height={17} {...p} />
        <Line x1={6} y1={11} x2={8} y2={11} {...p} />
        <Line x1={6} y1={15} x2={8} y2={15} {...p} />
        <Line x1={16} y1={8} x2={18} y2={8} {...p} />
        <Line x1={16} y1={12} x2={18} y2={12} {...p} />
        <Line x1={16} y1={16} x2={18} y2={16} {...p} />
      </Svg>
    );
  }
  if (kind === 'atlas') {
    // An open book / compass — the Atlas's Architectural Intelligence.
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24">
        <Path d="M12 5 C9 3 5 3 3 4 V19 C5 18 9 18 12 20 C15 18 19 18 21 19 V4 C19 3 15 3 12 5 Z" {...p} />
        <Line x1={12} y1={5} x2={12} y2={20} {...p} />
        <Circle cx={12} cy={12} r={2.2} {...p} />
      </Svg>
    );
  }
  return (
    <Svg width={30} height={30} viewBox="0 0 24 24">
      <Path d="M4 4 H20 V17 H13 L10 20 L10 17 H4 Z" {...p} />
      <Line x1={7} y1={9} x2={17} y2={9} {...p} />
      <Line x1={7} y1={13} x2={14} y2={13} {...p} />
    </Svg>
  );
}

export default function Atlas() {
  const { style: styleParam } = useLocalSearchParams<{ style?: string }>();
  const [showBuildings, setShowBuildings] = useState<boolean>(!!styleParam);

  const sorted = useMemo(() => [...buildings].sort((a, b) => sortYear(a) - sortYear(b)), []);

  // Architects who are named on a building, for the scrolling strip.
  const strip = useMemo(() => {
    const named = new Set(
      buildings.map((b) => b.architect.replace(/ \(attributed\)$/, '')).filter((n) => !/^(unverified|unknown|unattributed)/i.test(n))
    );
    return architects.filter((a) => named.has(a.name));
  }, []);

  const goToBuilding = (building: Building) => {
    router.push({ pathname: '/locating', params: { buildingId: String(building.id) } });
  };

  const styleToMap = (styleName?: string) => {
    const tour = styleName ? STYLE_TOUR[styleName] : undefined;
    router.push({ pathname: '/map', params: tour ? { tour } : {} });
  };

  const toggleBuildings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowBuildings((o) => !o);
  };

  const tiles: { kind: 'buildings' | 'atlas' | 'stories'; label: string; onPress: () => void; active?: boolean }[] = [
    { kind: 'buildings', label: 'Buildings', onPress: toggleBuildings, active: showBuildings },
    { kind: 'atlas', label: 'Atlas', onPress: () => router.push('/dictionary' as never) },
    { kind: 'stories', label: 'Stories', onPress: () => router.push('/field' as never) },
  ];

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Atlas</Text>

        <CircularOverviewMap buildings={buildings} frameBuildings={buildings} onSelect={goToBuilding} />

        {/* Three tiles under the map: Buildings · Atlas · Stories */}
        <View style={styles.tileRow}>
          {tiles.map((t) => (
            <Pressable
              key={t.kind}
              onPress={t.onPress}
              style={({ pressed }) => [styles.tile, t.active && styles.tileOn, pressed && styles.tilePressed]}
            >
              <TileGlyph kind={t.kind} color={t.active ? colors.white : colors.terracotta} />
              <Text style={[styles.tileLabel, t.active && styles.tileLabelOn]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

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

        {/* The architects, scrolling — tap through to each one's page. */}
        {strip.length > 0 ? (
          <View style={styles.stripWrap}>
            <Text style={styles.stripHeading}>The architects</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
              {strip.map((a) => {
                const portrait = portraitFor(a.name);
                const initials = a.name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('') || '?';
                return (
                  <Pressable
                    key={a.name}
                    onPress={() => router.push({ pathname: '/architects/[name]', params: { name: a.name } })}
                    style={({ pressed }) => [styles.stripItem, pressed && styles.tilePressed]}
                  >
                    {portrait ? (
                      <Image source={portrait} style={styles.stripAvatar} />
                    ) : (
                      <View style={[styles.stripAvatar, styles.stripAvatarEmpty]}>
                        <Text style={styles.stripAvatarText}>{initials}</Text>
                      </View>
                    )}
                    <Text style={styles.stripName} numberOfLines={2}>{a.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* City context — how the city grew, and who built in which style. */}
        <Text style={styles.contextHeading}>City context</Text>
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

  // Three tiles under the map
  tileRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: '#2A1008',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tileOn: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  tilePressed: { transform: [{ scale: 0.97 }], opacity: 0.85 },
  tileLabel: { ...ui.buttonLabel, fontSize: 13, color: colors.ink },
  tileLabelOn: { color: colors.white },

  expanded: {
    gap: spacing.base,
    marginTop: spacing.lg,
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

  // Architects strip
  stripWrap: { marginTop: spacing.xxl },
  stripHeading: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.base },
  stripRow: { gap: spacing.lg, paddingRight: spacing.lg },
  stripItem: { width: 84, alignItems: 'center', gap: spacing.sm },
  stripAvatar: { width: 64, height: 64, borderRadius: 32 },
  stripAvatarEmpty: { backgroundColor: colors.terracottaTint, alignItems: 'center', justifyContent: 'center' },
  stripAvatarText: { ...editorial.cardTitle, color: colors.terracottaTextOnTint },
  stripName: { ...ui.metadataSmall, color: colors.ink, textAlign: 'center' },

  contextHeading: { ...editorial.cardTitleLg, color: colors.ink, marginTop: spacing.xxl, marginBottom: spacing.sm },
  chartCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
  },
  chartTitle: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.sm },
});
