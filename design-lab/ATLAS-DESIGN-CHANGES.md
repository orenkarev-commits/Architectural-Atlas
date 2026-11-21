# Atlas design changes — summary and full code

Commit `70bd950` on GitHub `main` (orenkarev-commits/Architectural-Atlas). Later commits by other sessions (section icons, identity) sit on top locally on branch `snapshot/2026-11-15-atlas`; the code below is the current file contents.

## Summary

1. **Building page → Listing layout** (`app/building/[id].tsx`): swipeable hero (photo, then archive plans) with dots and 1/N counter; name, address (→ map), note; facts row built · style · years (years only for firm dates); **Architect** heading then portrait/initials + name (→ bio; '?' and no link when unattributed); sticky bottom bar with address + **Walk there** (→ map); press feedback on every tappable element.
2. **Charts** (`components/AtlasCharts.tsx`, new): **Building waves** (smooth stacked curves by style, tap to list a 5-year span) and **Who built what style** (architect × style grid, tap cell to list, name → bio). On the Atlas page, and on every building page with that building marked.
3. **Dark mode** (`theme/tokens.ts` light/dark palettes chosen from the phone setting at launch; `app.config.ts` userInterfaceStyle → automatic; dark map style in `lib/mapStyle.ts` + `components/MapStyled.tsx`; dark web tiles in `web-stubs/react-native-maps.js`; hard-coded colours in ~23 screens/components replaced with tokens).

## Why you might not see them

- **Expo Go on the phone:** the dev server (`expo start --go`) has been running since before these edits. Stop it (Ctrl-C), restart with `EXPO_OFFLINE=1 npx expo start --go`, then fully close and reopen Expo Go.
- **A built/installed app (TestFlight, development build) or the web export in `dist/`:** those are snapshots. `dist/` was exported on Nov 7 and contains none of this. They need a new build/export to show the changes.

## Files changed by the design work

```
 app.config.ts                      |  25 +--
 app/ar/index.tsx                   |  12 +-
 app/architects/[name].tsx          | 128 +++++++++++--
 app/architects/index.tsx           | 112 ++++++++++--
 app/atlas/index.tsx                | 261 +++++++++++++-------------
 app/building/[id].tsx              | 366 +++++++++++++++++++++++++------------
 app/dictionary.tsx                 |   2 +-
 app/field/index.tsx                | 146 ++++++++++-----
 app/index.tsx                      | 285 +++++++++++++++--------------
 app/innovations.tsx                |  37 +++-
 app/locating.tsx                   |   2 +-
 app/map/index.tsx                  | 224 ++++++++++++++++++++---
 app/materials.tsx                  |   2 +-
 app/story/[id].tsx                 |   4 +-
 app/style/[name].tsx               |   2 +-
 components/ArchitectRow.tsx        |   2 +-
 components/AtlasCharts.tsx         | 351 +++++++++++++++++++++++++++++++++++
 components/BackButton.tsx          |   2 +-
 components/BuildingRow.tsx         |   2 +-
 components/CircularOverviewMap.tsx |   2 +-
 components/CollapsibleSection.tsx  |  76 ++++++++
 components/CompassDial.tsx         |   8 +-
 components/HomeButton.tsx          |   2 +-
 components/MapStyled.tsx           |   7 +-
 components/SplashOverlay.tsx       |   6 +-
 components/StyleTimeline.tsx       |   2 +-
 lib/bullets.ts                     |  26 +++
 lib/mapStyle.ts                    |  12 ++
 lib/search.ts                      |   2 +-
 theme/tokens.ts                    |  61 ++++++-
 web-stubs/react-native-maps.js     |   3 +-
 31 files changed, 1634 insertions(+), 538 deletions(-)
```

## `components/AtlasCharts.tsx` (full)

```tsx
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { buildings } from '../data/buildings';
import { architects } from '../data/architects';
import type { Building, BuildingStyle } from '../data/types';
import { parseYear } from '../lib/year';
import { colors, radii, spacing } from '../theme/tokens';
import { ui } from '../theme/typography';

/**
 * Two collection charts drawn from `data/buildings.ts` at runtime, so they stay
 * in sync as buildings are added. Plain Views, no chart library.
 * Pass `highlightId` to mark one building as a point on both charts.
 */

const STYLE_ORDER: BuildingStyle[] = [
  'Ottoman Era',
  'Eclectic',
  'Art Deco',
  'International Style',
  'Early Modernism',
  'Early Brutalist',
];

export const STYLE_COLOR: Record<BuildingStyle, string> = {
  'Ottoman Era': '#8A7F76',
  Eclectic: colors.terracotta,
  'Art Deco': '#B8862B',
  'International Style': colors.mint,
  'Early Modernism': '#3E6E9E',
  'Early Brutalist': '#6E4A7E',
};

const SHORT: Record<BuildingStyle, string> = {
  'Ottoman Era': 'Ottoman',
  Eclectic: 'Eclectic',
  'Art Deco': 'Art Deco',
  'International Style': 'International',
  'Early Modernism': 'Early Modern',
  'Early Brutalist': 'Brutalist',
};

const unattributed = (a: string) => /^(unknown|unattributed|unverified)/i.test(a);
const openBuilding = (b: Building) =>
  router.push({ pathname: '/building/[id]', params: { id: String(b.id) } });

function Legend({ styles: list }: { styles: BuildingStyle[] }) {
  return (
    <View style={s.legend}>
      {list.map((st) => (
        <View key={st} style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: STYLE_COLOR[st] }]} />
          <Text style={s.legendText}>{st}</Text>
        </View>
      ))}
    </View>
  );
}

/* ───────────── Building waves: smooth stacked curves by style ───────────── */

const BIN = 5;
const START = 1875;
const END = 1960;
const SLICES = 90;
const PLOT_H = 150;

/** Monotone cubic (Fritsch–Carlson) through evenly spaced points: smooth, never overshoots below 0. */
function monotone(ys: number[]) {
  const n = ys.length;
  const d = ys.slice(1).map((y, i) => y - ys[i]);
  const m = ys.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x: number) => {
    const i = Math.max(0, Math.min(n - 2, Math.floor(x)));
    const t = x - i, t2 = t * t, t3 = t2 * t;
    const v = (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * m[i + 1];
    return Math.max(0, v);
  };
}

export function BuildingWaves({ highlightId }: { highlightId?: number }) {
  const [width, setWidth] = useState(0);
  const [pickedBin, setPickedBin] = useState<number | null>(null);
  const target = highlightId ? buildings.find((b) => b.id === highlightId) : undefined;
  const targetYear = target ? parseYear(target.year) : 0;

  const model = useMemo(() => {
    const dated = buildings.filter((b) => parseYear(b.year));
    const binStarts: number[] = [];
    for (let y = START; y < END; y += BIN) binStarts.push(y);
    const present = STYLE_ORDER.filter((st) => dated.some((b) => b.style === st));
    const series = present.map((st) =>
      monotone(binStarts.map((from) => dated.filter((b) => b.style === st && parseYear(b.year) >= from && parseYear(b.year) < from + BIN).length))
    );
    // x in bin units, centred on each bin
    const slices = Array.from({ length: SLICES }, (_, i) => {
      const x = (i + 0.5) / SLICES * binStarts.length - 0.5;
      return present.map((_, k) => series[k](Math.max(0, Math.min(binStarts.length - 1, x))));
    });
    const max = Math.max(1, ...slices.map((sl) => sl.reduce((p, v) => p + v, 0)));
    return { dated, binStarts, present, series, slices, max };
  }, []);

  const scale = (PLOT_H - 6) / model.max;
  const yearToX = (y: number) => ((y - START) / (END - START)) * width;

  // Marked point: centre of this building's style band at its year.
  let pin: { left: number; bottom: number } | null = null;
  if (target && targetYear && width) {
    const x = (targetYear - START) / BIN - 0.5;
    const k = model.present.indexOf(target.style);
    const below = model.series.slice(0, k).reduce((p, f) => p + f(Math.max(0, x)), 0);
    const own = model.series[k](Math.max(0, x));
    pin = { left: yearToX(targetYear), bottom: (below + own / 2) * scale };
  }

  const binOf = (from: number) =>
    model.dated.filter((b) => parseYear(b.year) >= from && parseYear(b.year) < from + BIN);
  const picked = pickedBin !== null ? binOf(pickedBin) : [];

  return (
    <View>
      <Text style={s.caption}>
        How many atlas buildings went up in each 5-year span, stacked by style. Tap the chart to list that span.
      </Text>
      <View style={[s.wavePlot, { height: PLOT_H }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {model.slices.map((sl, i) => (
          <View key={i} style={s.slice}>
            {sl.map((v, k) => (v * scale > 0.3 ? (
              <View key={k} style={{ height: v * scale, backgroundColor: STYLE_COLOR[model.present[k]], opacity: target && model.present[k] !== target.style ? 0.55 : 0.92 }} />
            ) : null))}
          </View>
        ))}
        {width ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={(e) => {
              const yr = START + (e.nativeEvent.locationX / width) * (END - START);
              const from = model.binStarts.find((f) => yr >= f && yr < f + BIN) ?? null;
              setPickedBin(from === pickedBin ? null : from);
            }}
          />
        ) : null}
        {pin ? (
          <View pointerEvents="none" style={[s.pinWrap, { left: pin.left - 7, bottom: pin.bottom - 7 }]}>
            <View style={s.pinDot} />
          </View>
        ) : null}
        {pin ? (
          <View pointerEvents="none" style={[s.pinLine, { left: pin.left, height: PLOT_H - pin.bottom - 8 }]} />
        ) : null}
      </View>
      <View style={s.axis}>
        {[1880, 1900, 1920, 1940, 1960].map((y) => (
          <Text key={y} style={[s.axisText, { left: `${((y - START) / (END - START)) * 100}%` }]}>
            {y}
          </Text>
        ))}
      </View>
      <Legend styles={model.present} />
      {target ? (
        <Text style={s.note}>
          {targetYear
            ? `Marked: ${target.name} (${target.year}), in the ${target.style} band.`
            : 'This building has no date yet, so it is not on the chart.'}
        </Text>
      ) : null}
      {pickedBin !== null ? (
        <View style={s.list}>
          <Text style={s.listHead}>{`${pickedBin}–${pickedBin + BIN - 1} · ${picked.length} building${picked.length === 1 ? '' : 's'}`}</Text>
          {picked.map((b) => (
            <Pressable key={b.id} onPress={() => openBuilding(b)} style={s.listRow}>
              <View style={[s.legendDot, { backgroundColor: STYLE_COLOR[b.style], marginTop: 4 }]} />
              <Text style={[s.listText, b.id === highlightId && s.nameOn]}>{b.name}</Text>
              <Text style={s.listYear}>{String(b.year)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ───────────── Who built what style: architects × styles grid ───────────── */

export function WhoBuiltWhatStyle({ highlightId, maxRows = 10 }: { highlightId?: number; maxRows?: number }) {
  const target = highlightId ? buildings.find((b) => b.id === highlightId) : undefined;
  const [picked, setPicked] = useState<{ a: string; st: BuildingStyle } | null>(null);

  const { rows, cols } = useMemo(() => {
    const named = buildings.filter((b) => !unattributed(b.architect));
    const counts = new Map<string, number>();
    named.forEach((b) => counts.set(b.architect, (counts.get(b.architect) ?? 0) + 1));
    let list = [...counts.entries()].sort((x, y) => y[1] - x[1]).map(([a]) => a).slice(0, maxRows);
    if (target && !unattributed(target.architect) && !list.includes(target.architect)) {
      list = [...list, target.architect];
    }
    const present = STYLE_ORDER.filter((st) => named.some((b) => b.style === st));
    return { rows: list, cols: present };
  }, [target, maxRows]);

  const cell = (a: string, st: BuildingStyle) => buildings.filter((b) => b.architect === a && b.style === st);
  const max = Math.max(1, ...rows.flatMap((a) => cols.map((st) => cell(a, st).length)));
  const pickedList = picked ? cell(picked.a, picked.st) : [];

  return (
    <View>
      <Text style={s.caption}>
        Architects against styles; the deeper the colour, the more buildings. Tap a cell to list them, a name for the bio.
      </Text>
      <View style={s.gridHead}>
        <View style={s.nameCol} />
        {cols.map((st) => (
          <View key={st} style={s.headCell}>
            <Text style={s.headText}>{SHORT[st]}</Text>
          </View>
        ))}
      </View>
      {rows.map((a) => {
        const bio = architects.find((x) => x.name === a.replace(/ \(attributed\)$/, ''));
        const isTargetRow = target?.architect === a;
        return (
          <View key={a} style={s.gridRow}>
            <Pressable
              style={s.nameCol}
              disabled={!bio}
              onPress={() => bio && router.push({ pathname: '/architects/[name]', params: { name: a } })}
            >
              <Text style={[s.name, isTargetRow && s.nameOn]} numberOfLines={1}>
                {a}
              </Text>
            </Pressable>
            {cols.map((st) => {
              const n = cell(a, st).length;
              const on = isTargetRow && target?.style === st;
              return (
                <Pressable
                  key={st}
                  disabled={!n}
                  onPress={() => setPicked(picked?.a === a && picked.st === st ? null : { a, st })}
                  style={[
                    s.cell,
                    n
                      ? { backgroundColor: STYLE_COLOR[st], opacity: 0.3 + (0.7 * n) / max }
                      : { backgroundColor: colors.surfaceTint },
                    on && s.cellOn,
                  ]}
                >
                  {n ? <Text style={s.cellText}>{n}</Text> : null}
                  {on ? <View style={s.cellPin} /> : null}
                </Pressable>
              );
            })}
          </View>
        );
      })}
      <Legend styles={cols} />
      {target ? (
        <Text style={s.note}>
          {unattributed(target.architect)
            ? 'This building has no named architect yet, so it is not on the grid.'
            : `Marked: ${target.architect} · ${target.style}.`}
        </Text>
      ) : null}
      {picked ? (
        <View style={s.list}>
          <Text style={s.listHead}>{`${picked.a} · ${picked.st}`}</Text>
          {pickedList.map((b) => (
            <Pressable key={b.id} onPress={() => openBuilding(b)} style={s.listRow}>
              <Text style={[s.listText, b.id === highlightId && s.nameOn]}>{b.name}</Text>
              <Text style={s.listYear}>{String(b.year)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  caption: { ...ui.metadata, color: colors.muted, marginBottom: spacing.md, lineHeight: 17 },
  wavePlot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  slice: { flex: 1, flexDirection: 'column-reverse', marginRight: -1.5 },
  pinWrap: { position: 'absolute', width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  pinDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink, borderWidth: 2.5, borderColor: colors.surface },
  pinLine: { position: 'absolute', top: 0, width: 1, backgroundColor: colors.ink, opacity: 0.35 },
  axis: { height: 16, marginTop: 4 },
  axisText: { ...ui.metadataSmall, color: colors.muted, position: 'absolute', transform: [{ translateX: -12 }] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { ...ui.metadataSmall, color: colors.muted },
  note: { ...ui.metadata, color: colors.terracottaTextOnTint, marginTop: spacing.md },
  gridHead: { flexDirection: 'row', marginBottom: 4, height: 64, alignItems: 'flex-end' },
  headCell: { flex: 1, alignItems: 'center', height: 64, justifyContent: 'flex-end' },
  headText: {
    ...ui.metadataSmall,
    color: colors.muted,
    width: 90,
    transform: [{ translateX: 30 }, { translateY: -22 }, { rotate: '-45deg' }],
  },
  headDot: { width: 10, height: 10, borderRadius: 5 },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  nameCol: { width: 112, paddingRight: spacing.md },
  name: { ...ui.metadata, color: colors.ink, textAlign: 'right' },
  nameOn: { color: colors.terracottaTextOnTint, fontWeight: '700' },
  cell: {
    flex: 1,
    height: 22,
    marginHorizontal: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: { opacity: 1, borderWidth: 2, borderColor: colors.ink },
  cellText: { ...ui.metadataSmall, color: colors.white },
  cellPin: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  list: { marginTop: spacing.md },
  listHead: { ...ui.metadata, color: colors.muted, marginBottom: 4 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  listText: { ...ui.body, fontSize: 13, color: colors.ink, flex: 1 },
  listYear: { ...ui.metadata, color: colors.muted },
});
```

## `app/building/[id].tsx` (full)

```tsx
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Marker } from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MapStyled } from '../../components/MapStyled';
import { BackButton } from '../../components/BackButton';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { SectionIcon } from '../../components/SectionIcon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { buildings } from '../../data/buildings';
import { architects } from '../../data/architects';
import { stories } from '../../data/stories';
import { plansForBuilding, type Plan } from '../../data/plans';
import { PlanViewer } from '../../components/PlanViewer';
import { BuildingWaves, WhoBuiltWhatStyle } from '../../components/AtlasCharts';
import { toBullets } from '../../lib/bullets';
import { parseYear } from '../../lib/year';
import { portraitFor } from '../../data/portraits';
import { toLatLng, toRegion } from '../../lib/coords';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

const MAP_HEIGHT = 300;
const SHEET_OVERLAP = 28;
const HERO_HEIGHT = 250;
const BAR_SPACE = 90;

const PLAN_KIND_LABEL: Record<string, string> = {
  plan: 'Floor plan',
  elevation: 'Elevation',
  section: 'Section',
  site: 'Survey sheet',
};

function Bullets({ text }: { text: string }) {
  const items = toBullets(text);
  return (
    <View style={styles.bullets}>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export default function BuildingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const building = buildings.find((b) => String(b.id) === id);
  const architect = building ? architects.find((a) => a.name === building.architect.replace(/ \(attributed\)$/, '')) : undefined;
  const plans = building ? plansForBuilding(building.id) : [];
  const story = building ? stories.find((s) => s.buildingId === building.id) : undefined;
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [photoBig, setPhotoBig] = useState(false);
  const [slide, setSlide] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, [opacity, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!building) return null;

  const builtYear = parseYear(building.year);
  // Only state an age when the year itself is a firm date (e.g. 1932, 1922–27), never for 'Early 1920s' / 'c. 1932'.
  const firmYear = typeof building.year === 'number' || /^\d{4}/.test(String(building.year));
  const age = builtYear && firmYear ? new Date().getFullYear() - builtYear : null;
  const unattributed = /^(unverified|unknown|unattributed)/i.test(building.architect);
  const portrait = portraitFor(building.architect);
  const initials =
    building.architect
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .slice(0, 2)
      .join('') || '?';
  const avatarLabel = unattributed ? '?' : initials;
  const openMap = () => router.push({ pathname: '/map', params: { focus: String(building.id) } });
  const openAtlas = (style?: string) =>
    router.push(style ? { pathname: '/atlas', params: { style } } : '/atlas');
  const slides: { key: string; src: any; onPress: () => void }[] = [
    { key: 'photo', src: building.image, onPress: () => setPhotoBig(true) },
    ...plans.map((plan, i) => ({ key: `plan-${i}`, src: plan.src, onPress: () => setActivePlan(plan) })),
  ];
  const pressed = ({ pressed: p }: { pressed: boolean }) => (p ? styles.pressed : null);

  return (
    <View style={styles.container}>
      <MapStyled
        style={styles.map}
        initialRegion={toRegion(building.resolved, 17)}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={toLatLng(building.resolved)} />
      </MapStyled>
      <BackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Listing layout: swipeable hero (photo, then archive sheets) */}
          <View style={[styles.hero, { width }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={32}
              onScroll={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {slides.map((sl) => (
                <Pressable key={sl.key} onPress={sl.onPress} accessibilityRole="imagebutton">
                  <Image
                    source={sl.src}
                    style={{ width, height: HERO_HEIGHT }}
                    resizeMode={sl.key === 'photo' ? 'cover' : 'contain'}
                  />
                </Pressable>
              ))}
            </ScrollView>
            {slides.length > 1 ? (
              <>
                <View style={styles.dots} pointerEvents="none">
                  {slides.map((sl, i) => (
                    <View key={sl.key} style={[styles.dot, i === slide && styles.dotOn]} />
                  ))}
                </View>
                <View style={styles.count} pointerEvents="none">
                  <Text style={styles.countText}>{`${slide + 1} / ${slides.length}`}</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.name}>{building.name}</Text>
            <Pressable onPress={openMap} hitSlop={6} style={pressed}>
              <Text style={styles.address}>{building.address}</Text>
            </Pressable>
            {building.styleNote ? <Text style={styles.note}>{building.styleNote}</Text> : null}
          </View>

          <View style={styles.facts}>
            <Pressable style={(st) => [styles.fact, pressed(st)]} onPress={() => openAtlas()}>
              <Text style={styles.factValue}>{String(building.year)}</Text>
              <Text style={styles.factLabel}>built</Text>
            </Pressable>
            <Pressable
              style={(st) => [styles.fact, styles.factDivider, pressed(st)]}
              onPress={() => openAtlas(building.style)}
            >
              <Text style={styles.factValue}>{building.style}</Text>
              <Text style={styles.factLabel}>style</Text>
            </Pressable>
            {age ? (
              <Pressable style={(st) => [styles.fact, styles.factDivider, pressed(st)]} onPress={() => openAtlas()}>
                <Text style={styles.factValue}>{age}</Text>
                <Text style={styles.factLabel}>years</Text>
              </Pressable>
            ) : null}
          </View>

          <View>
            <Text style={styles.sectionHeading}>Architect</Text>
            <Pressable
              style={(st) => [styles.architectRow, pressed(st)]}
              disabled={!architect}
              onPress={() => {
                if (architect) {
                  router.push({ pathname: '/architects/[name]', params: { name: architect.name } });
                }
              }}
            >
              {portrait ? (
                <Image source={portrait} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Text style={styles.avatarText}>{avatarLabel}</Text>
                </View>
              )}
              <Text style={styles.architectName}>{building.architect}</Text>
              {architect ? <Text style={styles.chevron}>›</Text> : null}
            </Pressable>
          </View>

          {/* Each section is a collapsible terracotta-strip bubble.
              Order: the Story leads, then Why it Matters, Life, Materials, Archive. */}
          {story ? (
            <CollapsibleSection title="The Story" icon={<SectionIcon name="story" />} defaultOpen>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyText}>{story.reveal}</Text>
            </CollapsibleSection>
          ) : null}

          {plans.length > 0 ? (
            <CollapsibleSection title="From the Archive" icon={<SectionIcon name="archive" />} defaultOpen>
              {plans.map((plan, i) => (
                <View key={i} style={styles.planBlock}>
                  <Pressable onPress={() => setActivePlan(plan)}>
                    <Image source={plan.src} style={styles.planImage} resizeMode="contain" />
                    <View style={styles.zoomHint}>
                      <Text style={styles.zoomHintText}>Tap to study ⤢</Text>
                    </View>
                  </Pressable>
                  <Text style={styles.planKind}>
                    {PLAN_KIND_LABEL[plan.kind]}
                    {plan.year ? ` · ${plan.year}` : ''}
                  </Text>
                  <Text style={styles.planCaption}>{plan.caption}</Text>
                </View>
              ))}
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection title="Why it Matters" icon={<SectionIcon name="matters" />} defaultOpen={!story}>
            <Bullets text={building.whyItMatters} />
          </CollapsibleSection>

          {building.timeline && building.timeline.length > 0 ? (
            <CollapsibleSection title="Life of the Building" icon={<SectionIcon name="life" />}>
              <View style={styles.timeline}>
                {building.timeline.map((t, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <Text style={styles.timelineYear}>{t.year}</Text>
                    <Text style={styles.timelineNote}>{t.note}</Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>
          ) : null}

          {building.materials ? (
            <CollapsibleSection title="Materials & Construction" icon={<SectionIcon name="materials" />}>
              <Bullets text={building.materials} />
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection title="Building Waves">
            <BuildingWaves highlightId={building.id} />
          </CollapsibleSection>

          <CollapsibleSection title="Who Built What Style">
            <WhoBuiltWhatStyle highlightId={building.id} />
          </CollapsibleSection>

          <PrimaryButton label="Open in Field research" onPress={() => router.push('/field')} />
        </Animated.View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable onPress={openMap} style={(st) => [styles.barAddress, pressed(st)]}>
          <Text style={styles.barAddressText} numberOfLines={1}>{building.address}</Text>
        </Pressable>
        <Pressable onPress={openMap} style={(st) => [styles.barButton, pressed(st)]}>
          <Text style={styles.barButtonText}>Walk there</Text>
        </Pressable>
      </View>

      <PlanViewer
        visible={activePlan !== null}
        source={activePlan?.src ?? null}
        caption={
          activePlan
            ? `${PLAN_KIND_LABEL[activePlan.kind]} · ${activePlan.year} — ${activePlan.caption}`
            : undefined
        }
        onClose={() => setActivePlan(null)}
      />

      <PlanViewer
        visible={photoBig}
        source={photoBig ? building.image : null}
        caption={`${building.name} · ${building.address}`}
        onClose={() => setPhotoBig(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapTile,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MAP_HEIGHT,
  },
  scrollContent: {
    paddingTop: MAP_HEIGHT - SHEET_OVERLAP,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.xxl,
    paddingTop: 0,
    paddingBottom: spacing.huge + BAR_SPACE,
    overflow: 'hidden',
    gap: spacing.lg,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.85 },
  hero: {
    marginHorizontal: -spacing.xxl,
    height: HERO_HEIGHT,
    backgroundColor: colors.surfaceTint,
  },
  dots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { backgroundColor: colors.surface },
  count: {
    position: 'absolute', right: 12, bottom: 8,
    backgroundColor: 'rgba(20,17,15,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  countText: { ...ui.metadataSmall, color: colors.white },
  titleBlock: { gap: spacing.xs, marginTop: spacing.sm },
  note: { ...ui.metadata, color: colors.muted },
  facts: {
    flexDirection: 'row',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.hairline,
    paddingVertical: spacing.lg,
  },
  fact: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm, minWidth: 0 },
  factDivider: { borderLeftWidth: 1, borderLeftColor: colors.hairline },
  factValue: { ...editorial.cardTitle, color: colors.ink, textAlign: 'center' },
  factLabel: { ...ui.metadata, color: colors.muted, marginTop: 2 },
  sectionHeading: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.base },
  architectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, flexShrink: 0 },
  avatarEmpty: { backgroundColor: colors.terracottaTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...editorial.cardTitle, color: colors.terracottaTextOnTint },
  chevron: { ...ui.body, fontSize: 22, color: colors.muted },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    paddingHorizontal: spacing.xxl, paddingTop: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
  barAddress: { flex: 1, minWidth: 0 },
  barAddressText: { ...ui.metadata, color: colors.muted },
  barButton: {
    backgroundColor: colors.terracotta, borderRadius: radii.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.base,
  },
  barButtonText: { ...ui.body, color: colors.white },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.hairline,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  name: {
    ...editorial.buildingName,
    color: colors.ink,
  },
  address: {
    ...ui.metadata,
    color: colors.terracottaTextOnTint,
  },
  architectName: {
    ...ui.body,
    fontSize: 16,
    flex: 1,
    color: colors.ink,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletDot: {
    ...ui.body,
    color: colors.terracotta,
    lineHeight: 22,
  },
  bulletText: {
    ...ui.body,
    flex: 1,
    color: colors.body,
  },
  timeline: {
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineYear: {
    ...ui.label,
    color: colors.terracotta,
    width: 76,
    paddingTop: 1,
  },
  timelineNote: {
    ...ui.body,
    flex: 1,
    color: colors.body,
  },
  storyTitle: {
    ...editorial.cardTitle,
    fontSize: 15,
    color: colors.ink,
  },
  storyText: {
    ...ui.body,
    color: colors.body,
  },
  planBlock: {
    gap: spacing.xs,
  },
  planImage: {
    width: '100%',
    height: 300,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceTint,
  },
  zoomHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(20,17,15,0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoomHintText: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
  },
  planKind: {
    ...ui.label,
    color: colors.label,
    marginTop: spacing.xs,
  },
  planCaption: {
    ...ui.body,
    fontSize: 13,
    color: colors.muted,
  },
});
```

## `theme/tokens.ts` (full)

```tsx
// Design tokens transcribed from the handoff README's "Design tokens" section.
// The original design authors colours in oklch(); React Native has no oklch
// support, so we use the hex equivalents the README itself supplies.

import { Appearance } from 'react-native';

/**
 * Light / dark. The scheme is read once at launch from the phone's setting
 * (Settings → Display → Dark). Every StyleSheet in the app reads `colors`
 * at module load, so switching the phone's theme applies on the next launch.
 */
export const scheme: 'light' | 'dark' = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
export const isDark = scheme === 'dark';

const light = {
  terracotta: '#C2531F',
  terracottaDark: '#A34115',
  terracottaTextOnTint: '#9E4A22',
  terracottaTint: 'rgba(194, 83, 31, 0.14)',
  ink: '#2E2620',
  inkSoft: '#332B24',
  body: '#4A403A',
  muted: '#6B5E55',
  mutedLight: '#776A60',
  label: '#7D6B5E',
  hairline: '#E8E2DA',
  surfaceTint: '#F7F3EE',
  darkSurface: '#4B4038',
  desk: '#E8E6E1',
  mapTile: '#F0EBE4',
  mint: '#2C5F4E',
  /** Literal white: text and icons on terracotta / photos. Same in both themes. */
  white: '#FFFFFF',
  /** Page and sheet background (was colors.white). */
  surface: '#FFFFFF',
  /** Collapsible-section bubble. */
  bubble: '#F5EFE7',
  /** Floating buttons and cards over the map. */
  chrome: 'rgba(255, 255, 255, 0.94)',
  /** Warm translucent wash (splash, field sheet). */
  warmScrim: 'rgba(251, 244, 234, 0.7)',
  /** Compass dial face and its ink. */
  dial: '#FBF8F4',
  dialInk: 'rgba(43,40,38,',
  neutralBadge: 'rgba(46, 38, 32, 0.06)', // year badge, ~oklch(94%) on white
  glassFill: 'rgba(255, 255, 255, 0.68)',
  glassFillStrong: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.88)',
};

// Warm charcoal, same terracotta family; text contrast ≥ 4.5:1 on `surface`.
const dark: typeof light = {
  terracotta: '#D9652F',
  terracottaDark: '#B8521F',
  terracottaTextOnTint: '#F0A47E',
  terracottaTint: 'rgba(224, 112, 60, 0.18)',
  ink: '#F4ECE4',
  inkSoft: '#EAE0D6',
  body: '#D8CCC2',
  muted: '#B0A196',
  mutedLight: '#A39488',
  label: '#AE9E92',
  hairline: '#3E3530',
  surfaceTint: '#2C2521',
  darkSurface: '#4B4038',
  desk: '#141110',
  mapTile: '#191412',
  mint: '#3F8A70',
  white: '#FFFFFF',
  surface: '#211B18',
  bubble: '#2C2521',
  chrome: 'rgba(40, 33, 29, 0.94)',
  warmScrim: 'rgba(25, 20, 18, 0.7)',
  dial: '#2A2320',
  dialInk: 'rgba(244,236,228,',
  neutralBadge: 'rgba(244, 236, 228, 0.08)',
  glassFill: 'rgba(40, 33, 29, 0.68)',
  glassFillStrong: 'rgba(40, 33, 29, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
};

export const colors = isDark ? dark : light;

export const gradient = {
  // linear-gradient(160deg, oklch(96% 0.022 70) 0%, oklch(88% 0.062 42) 100%)
  colors: (isDark ? ['#1E1815', '#3A2419'] : ['#FBF4EA', '#F0C9A8']) as readonly [string, string],
  angleDeg: 160,
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  xxxl: 26,
  huge: 34,
} as const;

export const radii = {
  xs: 9,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  sheet: 28,
  phone: 44,
  circle: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  circle: {
    shadowColor: 'rgba(120, 60, 20, 1)',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  chip: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  mapCircle: {
    shadowColor: 'rgba(90, 50, 20, 1)',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export const motion = {
  transitionMs: 150,
  lift: -2,
  liftLarge: -3,
  scaleSmall: 1.05,
} as const;
```

## `components/MapStyled.tsx` (full)

```tsx
import React, { forwardRef } from 'react';
import MapView, { MapViewProps, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle, mapStyleDark, mapUiProps } from '../lib/mapStyle';
import { colors, isDark, scheme } from '../theme/tokens';

/**
 * Shared map wrapper — every map instance in the app uses the same warm
 * Google Maps style (see lib/mapStyle.ts) so the map feels part of the app.
 */
export const MapStyled = forwardRef<MapView, MapViewProps>(function MapStyled(
  { style, children, ...rest },
  ref
) {
  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      customMapStyle={isDark ? mapStyleDark : mapStyle}
      userInterfaceStyle={scheme}
      {...mapUiProps}
      style={[{ backgroundColor: colors.mapTile }, style]}
      {...rest}
    >
      {children}
    </MapView>
  );
});
```

## `lib/mapStyle.ts` (full)

```tsx
// The exact Google Maps style array from the handoff README's "Google Maps
// configuration" section, applied to every map instance in the app. The warm
// cast is what makes the map feel part of the app rather than embedded in it.
// POI and transit are off deliberately — noise for this app. Road label icons
// off for the same reason. Street names stay.
export const mapStyle = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      { hue: '#ff6800' },
      { saturation: '20' },
      { lightness: '-8' },
      { gamma: '1.00' },
      { weight: '1.12' },
    ],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// Dark variant: same idea (warm cast, no POI/transit), on charcoal.
export const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#211B18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#B0A196' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#191412' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3A302A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14181C' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

// react-native-maps equivalent of the web prototype's
// `disableDefaultUI: true, gestureHandling: 'greedy'`.
export const mapUiProps = {
  showsCompass: false,
  showsScale: false,
  showsMyLocationButton: false,
  toolbarEnabled: false,
  zoomControlEnabled: false,
  rotateEnabled: true,
  pitchEnabled: false,
};
```

## Other edits (diff from commit 70bd950)

```diff
commit 70bd9507e2c33b30afd956c55c8b5465dea94b70
Author: Oren Karev <orenkarev@gmail.com>
Date:   Sun Nov 15 19:24:44 2026 +0200

    Listing-style building page, dark mode, style charts, plus pending atlas work
    
    - Building page redesigned as a listing: swipeable photo/plan hero, facts row,
      Architect heading with portrait, sticky "Walk there" bar; links unchanged
    - Dark mode following the system setting (theme tokens, maps, app config)
    - Building waves (smooth stacked curves) and Who built what style charts on
      the Atlas page and every building page, with the building marked
    - Project skills (ui-craft, motion, d3-viz, expo-*) in .claude/skills
    - Includes previously uncommitted data, asset and config work
    
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

diff --git a/app.config.ts b/app.config.ts
index 9e857c7..4404a55 100644
--- a/app.config.ts
+++ b/app.config.ts
@@ -8,10 +8,17 @@ const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
 const config: ExpoConfig = {
   name: 'Architectural Atlas',
   slug: 'architectural-atlas',
+  owner: 'oren2026',
   scheme: 'architectural-atlas',
   version: '1.0.0',
+  runtimeVersion: {
+    policy: 'appVersion',
+  },
+  updates: {
+    url: 'https://u.expo.dev/2639e838-5a8d-469e-b637-cfadd17a8225',
+  },
   orientation: 'portrait',
-  userInterfaceStyle: 'light',
+  userInterfaceStyle: 'automatic',
   newArchEnabled: true,
   icon: './assets/images/icon.png',
   ios: {
@@ -19,6 +26,7 @@ const config: ExpoConfig = {
     bundleIdentifier: 'com.architecturalatlas.app',
     config: {
       googleMapsApiKey: GOOGLE_MAPS_API_KEY,
+      usesNonExemptEncryption: false,
     },
   },
   android: {
@@ -54,26 +62,19 @@ const config: ExpoConfig = {
     [
       'expo-splash-screen',
       {
-        // Native pre-splash: the Nolli plan on the warm ground, so the JS
-        // splash (which adds the title + drift) takes over with no flash.
+        // Solid warm ground natively — no image — so there's no small, unscaled
+        // map before the app. The JS SplashOverlay draws the full Nolli drift +
+        // title on top, bridging cleanly from this warm screen.
         backgroundColor: '#FBF4EA',
-        image: './assets/images/nolli-tel-aviv.jpg',
-        resizeMode: 'cover',
       },
     ],
   ],
-  updates: {
-    url: 'https://u.expo.dev/33a0e3e5-2070-42a2-9c11-631389b45365',
-  },
-  runtimeVersion: {
-    policy: 'appVersion',
-  },
   extra: {
     router: {
       origin: false,
     },
     eas: {
-      projectId: '33a0e3e5-2070-42a2-9c11-631389b45365',
+      projectId: '2639e838-5a8d-469e-b637-cfadd17a8225',
     },
   },
 };
diff --git a/app/atlas/index.tsx b/app/atlas/index.tsx
index bd01025..81129ff 100644
--- a/app/atlas/index.tsx
+++ b/app/atlas/index.tsx
@@ -1,174 +1,189 @@
-import React, { useEffect, useMemo, useState } from 'react';
-import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
+import React, { useMemo, useState } from 'react';
+import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
 import { router, useLocalSearchParams } from 'expo-router';
 import { BackButton } from '../../components/BackButton';
 import { CircularOverviewMap } from '../../components/CircularOverviewMap';
 import { BuildingRow } from '../../components/BuildingRow';
-import { useAtlas } from '../../context/AtlasContext';
+import { BuildingWaves, WhoBuiltWhatStyle } from '../../components/AtlasCharts';
 import { buildings } from '../../data/buildings';
-import type { Building, BuildingStyle } from '../../data/types';
-import { timelineStyles, periodForStyle, styleByName } from '../../data/styles';
+import type { Building } from '../../data/types';
+import { timelineStyles } from '../../data/styles';
 import { parseYear } from '../../lib/year';
 import { colors, radii, spacing } from '../../theme/tokens';
 import { editorial, ui } from '../../theme/typography';
 
+if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
+  UIManager.setLayoutAnimationEnabledExperimental(true);
+}
+
 const sortYear = (b: Building) => {
   const y = parseYear(b.year);
   return y === 0 ? Infinity : y;
 };
 
+// The three knowledge pages, lined up under "All Buildings".
+const KNOWLEDGE: { label: string; path: string }[] = [
+  { label: 'Innovations', path: '/innovations' },
+  { label: 'Materials', path: '/materials' },
+  { label: 'Dictionary', path: '/dictionary' },
+];
+
+// A style → its Architecture tour on the main map (walks every building of that style).
+const STYLE_TOUR: Record<string, string> = {
+  'Ottoman Era': 'arch-ottoman',
+  Eclectic: 'arch-eclectic',
+  'Art Deco': 'arch-art-deco',
+  'Early Modernism': 'arch-early-modernism',
+  'International Style': 'arch-international',
+};
+
 export default function Atlas() {
   const { style: styleParam } = useLocalSearchParams<{ style?: string }>();
-  const { setFilterStyle, nearOrder, geoOffline } = useAtlas();
-  const [periodName, setPeriodName] = useState<string | null>(null);
-
-  // A style badge tapped elsewhere deep-links here → select that category.
-  useEffect(() => {
-    if (!styleParam) return;
-    setFilterStyle(styleParam);
-    const p = periodForStyle(styleParam as BuildingStyle);
-    setPeriodName(p?.name ?? styleParam);
-  }, [styleParam, setFilterStyle]);
-
-  const activePeriod = periodName ? styleByName(periodName) : undefined;
-
-  const visible = useMemo(() => {
-    if (!activePeriod) return buildings;
-    const match = activePeriod.matchStyles ?? [];
-    return buildings.filter((b) => match.includes(b.style));
-  }, [activePeriod]);
-
-  const sorted = useMemo(() => {
-    if (nearOrder) {
-      return [...visible].sort((a, b) => (nearOrder[a.id] ?? Infinity) - (nearOrder[b.id] ?? Infinity));
-    }
-    return [...visible].sort((a, b) => sortYear(a) - sortYear(b));
-  }, [visible, nearOrder]);
-
-  const headerRight = nearOrder
-    ? geoOffline
-      ? 'Nearest · stored coordinates'
-      : 'Nearest to you'
-    : `${sorted.length} of ${buildings.length}`;
+  const [showBuildings, setShowBuildings] = useState<boolean>(!!styleParam);
+
+  const sorted = useMemo(() => [...buildings].sort((a, b) => sortYear(a) - sortYear(b)), []);
 
   const goToBuilding = (building: Building) => {
     router.push({ pathname: '/locating', params: { buildingId: String(building.id) } });
   };
 
+  // Styles link to the main map — "see more buildings like this" as a guided walk.
+  const styleToMap = (styleName?: string) => {
+    const tour = styleName ? STYLE_TOUR[styleName] : undefined;
+    router.push({ pathname: '/map', params: tour ? { tour } : {} });
+  };
+
+  const toggleBuildings = () => {
+    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
+    setShowBuildings((o) => !o);
+  };
+
   return (
     <View style={styles.container}>
       <BackButton />
-      <FlatList
-        data={sorted}
-        keyExtractor={(item) => String(item.id)}
-        contentContainerStyle={styles.listContent}
-        ListHeaderComponent={
-          <>
-            <View style={styles.header}>
-              <Text style={styles.title}>Atlas</Text>
-              <Text style={styles.headerRight}>{headerRight}</Text>
-            </View>
+      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
+        <Text style={styles.title}>Atlas</Text>
 
-            {/* Knowledge area — the Atlas as a cumulative source */}
-            <View style={styles.knowledgeRow}>
-              <Pressable onPress={() => router.push('/dictionary')} hitSlop={6}>
-                <Text style={styles.knowledgeLink}>Dictionary</Text>
-              </Pressable>
-              <Text style={styles.knowledgeDot}>·</Text>
-              <Pressable onPress={() => router.push('/innovations')} hitSlop={6}>
-                <Text style={styles.knowledgeLink}>Innovations</Text>
-              </Pressable>
-              <Text style={styles.knowledgeDot}>·</Text>
-              <Pressable onPress={() => router.push('/materials')} hitSlop={6}>
-                <Text style={styles.knowledgeLink}>Materials</Text>
-              </Pressable>
-            </View>
+        <CircularOverviewMap buildings={buildings} frameBuildings={buildings} onSelect={goToBuilding} />
 
-            <CircularOverviewMap
-              buildings={Platform.OS === 'web' || activePeriod ? visible : buildings}
-              frameBuildings={buildings}
-              onSelect={goToBuilding}
-            />
-
-            {/* By style — the categories are the building classifications */}
-            <View style={styles.chips}>
-              <Pressable
-                onPress={() => setPeriodName(null)}
-                style={[styles.chip, !activePeriod && styles.chipOn]}
-              >
-                <Text style={[styles.chipText, !activePeriod && styles.chipTextOn]}>All</Text>
-              </Pressable>
-              {timelineStyles.map((s) => {
-                const on = activePeriod?.name === s.name;
-                return (
-                  <Pressable
-                    key={s.name}
-                    onPress={() => setPeriodName(s.name)}
-                    onLongPress={() => router.push({ pathname: '/style/[name]', params: { name: s.name } })}
-                    style={[styles.chip, on && styles.chipOn]}
-                  >
-                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.name}</Text>
-                    {s.transitional ? <Text style={styles.chipTag}>transitional</Text> : null}
-                  </Pressable>
-                );
-              })}
+        {/* A clean column of title buttons: All Buildings leads, the knowledge pages follow. */}
+        <View style={styles.stack}>
+          <Pressable style={[styles.bubble, styles.bubbleLead]} onPress={toggleBuildings}>
+            <Text style={[styles.bubbleText, styles.bubbleTextLead]}>All Buildings</Text>
+            <Text style={[styles.chevron, showBuildings && styles.chevronOpen]}>⌄</Text>
+          </Pressable>
+
+          {showBuildings ? (
+            <View style={styles.expanded}>
+              <Text style={styles.byStyle}>By style — tap to see them on the map</Text>
+              <View style={styles.chips}>
+                <Pressable onPress={() => styleToMap()} style={styles.chip}>
+                  <Text style={styles.chipText}>All</Text>
+                </Pressable>
+                {timelineStyles
+                  .filter((s) => s.kind === 'style')
+                  .map((s) => (
+                    <Pressable key={s.name} onPress={() => styleToMap(s.name)} style={styles.chip}>
+                      <Text style={styles.chipText}>{s.name}</Text>
+                    </Pressable>
+                  ))}
+              </View>
+              <View style={styles.rows}>
+                {sorted.map((b) => (
+                  <BuildingRow key={b.id} building={b} onPress={() => goToBuilding(b)} />
+                ))}
+              </View>
             </View>
-          </>
-        }
-        renderItem={({ item }) => (
-          <BuildingRow
-            building={item}
-            distanceKm={nearOrder ? nearOrder[item.id] : undefined}
-            onPress={() => goToBuilding(item)}
-          />
-        )}
-        ItemSeparatorComponent={() => <View style={{ height: spacing.base }} />}
-      />
+          ) : null}
+
+          {KNOWLEDGE.map((k) => (
+            <Pressable key={k.label} style={styles.bubble} onPress={() => router.push(k.path as never)}>
+              <Text style={styles.bubbleText}>{k.label}</Text>
+            </Pressable>
+          ))}
+        </View>
+
+        <View style={styles.chartCard}>
+          <Text style={styles.chartTitle}>Building waves</Text>
+          <BuildingWaves />
+        </View>
+        <View style={styles.chartCard}>
+          <Text style={styles.chartTitle}>Who built what style</Text>
+          <WhoBuiltWhatStyle />
+        </View>
+      </ScrollView>
     </View>
   );
 }
 
 const styles = StyleSheet.create({
-  container: { flex: 1, backgroundColor: colors.white },
-  listContent: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
-  header: {
-    flexDirection: 'row',
-    justifyContent: 'space-between',
-    alignItems: 'center',
-    paddingTop: 52,
-    marginLeft: 46,
-    marginBottom: spacing.sm,
+  chartCard: {
+    marginTop: spacing.xxl,
+    backgroundColor: colors.surface,
+    borderRadius: radii.lg,
+    borderWidth: 1,
+    borderColor: colors.hairline,
+    padding: spacing.lg,
+  },
+  chartTitle: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.sm },
+  container: { flex: 1, backgroundColor: colors.surface },
+  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
+  title: {
+    ...editorial.screenHeader,
+    fontSize: 40,
+    lineHeight: 46,
+    color: colors.ink,
+    textAlign: 'center',
+    paddingTop: 56,
+    marginBottom: spacing.lg,
   },
-  title: { ...editorial.screenHeader, color: colors.ink },
-  headerRight: { ...ui.metadataSmall, color: colors.muted },
-  knowledgeRow: {
+  stack: {
+    marginTop: spacing.xl,
+    gap: spacing.md,
+  },
+  bubble: {
+    alignSelf: 'center',
+    minWidth: 240,
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: spacing.sm,
-    marginBottom: spacing.md,
+    backgroundColor: colors.surfaceTint,
+    borderWidth: 1,
+    borderColor: colors.terracotta,
+    borderRadius: radii.circle,
+    paddingHorizontal: spacing.xxl,
+    paddingVertical: spacing.md,
   },
-  knowledgeLink: { ...editorial.cardTitle, fontSize: 15, color: colors.terracotta },
-  knowledgeDot: { ...ui.body, color: colors.muted },
+  bubbleLead: {
+    minWidth: 260,
+    paddingVertical: spacing.lg,
+  },
+  bubbleText: { ...editorial.cardTitle, fontSize: 15, color: colors.terracotta },
+  bubbleTextLead: { fontSize: 20, fontWeight: '700' },
+  chevron: { ...ui.body, fontSize: 20, lineHeight: 20, color: colors.terracotta },
+  chevronOpen: { transform: [{ rotate: '180deg' }] },
+  expanded: {
+    gap: spacing.base,
+    marginTop: spacing.xs,
+    marginBottom: spacing.sm,
+  },
+  byStyle: { ...ui.metadataSmall, color: colors.muted, textAlign: 'center' },
   chips: {
     flexDirection: 'row',
     flexWrap: 'wrap',
+    justifyContent: 'center',
     gap: spacing.sm,
-    marginTop: spacing.md,
-    marginBottom: spacing.xl,
+    marginBottom: spacing.sm,
   },
   chip: {
-    flexDirection: 'row',
-    alignItems: 'center',
-    gap: 6,
     paddingHorizontal: spacing.base,
     paddingVertical: spacing.sm,
     borderRadius: radii.md,
     borderWidth: 1,
     borderColor: colors.hairline,
+    backgroundColor: colors.surfaceTint,
   },
-  chipOn: { backgroundColor: colors.surfaceTint, borderColor: colors.terracotta },
-  chipText: { ...editorial.cardTitle, fontSize: 14, color: colors.muted },
-  chipTextOn: { color: colors.ink },
-  chipTag: { ...ui.metadataSmall, fontSize: 9, color: colors.terracotta },
+  chipText: { ...editorial.cardTitle, fontSize: 14, color: colors.ink },
+  rows: { gap: spacing.base },
 });
diff --git a/components/BackButton.tsx b/components/BackButton.tsx
index 7eb7055..e52fc7b 100644
--- a/components/BackButton.tsx
+++ b/components/BackButton.tsx
@@ -23,7 +23,7 @@ const styles = StyleSheet.create({
     width: 38,
     height: 38,
     borderRadius: radii.md,
-    backgroundColor: 'rgba(255,255,255,0.94)',
+    backgroundColor: colors.chrome,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#000',
diff --git a/components/CollapsibleSection.tsx b/components/CollapsibleSection.tsx
new file mode 100644
index 0000000..e81cfd1
--- /dev/null
+++ b/components/CollapsibleSection.tsx
@@ -0,0 +1,76 @@
+import React, { useState } from 'react';
+import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
+import { colors, radii, spacing } from '../theme/tokens';
+import { editorial, ui } from '../theme/typography';
+
+if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
+  UIManager.setLayoutAnimationEnabledExperimental(true);
+}
+
+/**
+ * A collapsible "bubble" — the terracotta-strip treatment of the research
+ * thread, with a bold title that toggles open on tap. Keeps a building page
+ * clean: every section is closed until the reader opens it.
+ */
+export function CollapsibleSection({
+  title,
+  defaultOpen = false,
+  children,
+}: {
+  title: string;
+  defaultOpen?: boolean;
+  children: React.ReactNode;
+}) {
+  const [open, setOpen] = useState(defaultOpen);
+  const toggle = () => {
+    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
+    setOpen((o) => !o);
+  };
+  return (
+    <View style={styles.bubble}>
+      <Pressable onPress={toggle} style={styles.header} hitSlop={4}>
+        <Text style={styles.title}>{title}</Text>
+        <Text style={[styles.chevron, open && styles.chevronOpen]}>⌄</Text>
+      </Pressable>
+      {open ? <View style={styles.body}>{children}</View> : null}
+    </View>
+  );
+}
+
+const styles = StyleSheet.create({
+  bubble: {
+    backgroundColor: colors.bubble,
+    borderLeftWidth: 3,
+    borderLeftColor: colors.terracotta,
+    borderRadius: radii.lg,
+    overflow: 'hidden',
+  },
+  header: {
+    flexDirection: 'row',
+    alignItems: 'center',
+    justifyContent: 'space-between',
+    paddingVertical: spacing.lg,
+    paddingHorizontal: spacing.xl,
+  },
+  title: {
+    ...editorial.cardTitle,
+    fontSize: 16,
+    fontWeight: '700',
+    color: colors.ink,
+  },
+  chevron: {
+    ...ui.body,
+    fontSize: 20,
+    lineHeight: 20,
+    color: colors.terracotta,
+  },
+  chevronOpen: {
+    transform: [{ rotate: '180deg' }],
+  },
+  body: {
+    paddingHorizontal: spacing.xl,
+    paddingBottom: spacing.xl,
+    paddingTop: 2,
+    gap: spacing.md,
+  },
+});
diff --git a/components/CompassDial.tsx b/components/CompassDial.tsx
index 7bcac3c..c073d0a 100644
--- a/components/CompassDial.tsx
+++ b/components/CompassDial.tsx
@@ -149,7 +149,7 @@ function formatKm(km: number): string {
   return `${km.toFixed(1)} km`;
 }
 
-const INK = 'rgba(43,40,38,';
+const INK = colors.dialInk;
 
 const styles = StyleSheet.create({
   wrap: { alignItems: 'center', gap: 10 },
@@ -157,14 +157,14 @@ const styles = StyleSheet.create({
     width: DIAL,
     height: DIAL,
     borderRadius: R,
-    backgroundColor: colors.white,
+    backgroundColor: colors.surface,
     overflow: 'hidden',
     alignItems: 'center',
     justifyContent: 'center',
   },
   faceWash: {
     ...StyleSheet.absoluteFillObject,
-    backgroundColor: '#FBF8F4',
+    backgroundColor: colors.dial,
   },
   ring: {
     ...StyleSheet.absoluteFillObject,
@@ -219,7 +219,7 @@ const styles = StyleSheet.create({
     width: HUB,
     height: HUB,
     borderRadius: HUB / 2,
-    backgroundColor: colors.white,
+    backgroundColor: colors.surface,
     borderWidth: 1,
     borderColor: INK + '0.3)',
     alignItems: 'center',
diff --git a/components/HomeButton.tsx b/components/HomeButton.tsx
index 83e8104..43e5dca 100644
--- a/components/HomeButton.tsx
+++ b/components/HomeButton.tsx
@@ -35,7 +35,7 @@ const styles = StyleSheet.create({
     width: 38,
     height: 38,
     borderRadius: radii.md,
-    backgroundColor: 'rgba(255,255,255,0.94)',
+    backgroundColor: colors.chrome,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#000',
diff --git a/components/SplashOverlay.tsx b/components/SplashOverlay.tsx
index 1b1d86d..725dbe8 100644
--- a/components/SplashOverlay.tsx
+++ b/components/SplashOverlay.tsx
@@ -15,10 +15,10 @@ import {
   NOLLI_EPI,
   NOLLI_TRAVEL,
 } from '../data/nolli';
-import { colors } from '../theme/tokens';
+import { colors, gradient } from '../theme/tokens';
 import { editorial, ui } from '../theme/typography';
 
-const WARM = '#FBF4EA';
+const WARM = gradient.colors[0];
 const TWO_PI = Math.PI * 2;
 const PLAN_RATIO = NOLLI_PLAN_WIDTH / NOLLI_PLAN_HEIGHT; // 1.79, matches the source
 const DRIFT_SECONDS = 44; // slow, continuous drift while the splash is up
@@ -106,7 +106,7 @@ const styles = StyleSheet.create({
   wrap: { backgroundColor: WARM, zIndex: 100, elevation: 100 },
   clip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
   planWrap: { position: 'absolute' },
-  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(251,244,234,0.62)' },
+  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.warmScrim },
   center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
   title: { ...editorial.welcomeTitle, color: colors.ink, textAlign: 'center' },
   subtitle: { ...ui.label, color: colors.terracotta, marginTop: 14, letterSpacing: 1.6 },
diff --git a/web-stubs/react-native-maps.js b/web-stubs/react-native-maps.js
index b581051..4e5f12c 100644
--- a/web-stubs/react-native-maps.js
+++ b/web-stubs/react-native-maps.js
@@ -9,7 +9,8 @@ const { View, Text } = require('react-native');
 
 const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
 const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
-const TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
+const DARK = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
+const TILES = `https://{s}.basemaps.cartocdn.com/${DARK ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;
 
 let leafletPromise = null;
 function loadLeaflet() {
```
