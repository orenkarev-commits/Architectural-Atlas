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
        const bio = architects.find((x) => x.name === a);
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
