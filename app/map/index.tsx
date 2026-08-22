import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MapStyled } from '../../components/MapStyled';
import { BackButton } from '../../components/BackButton';
import { buildings } from '../../data/buildings';
import { timelineStyles, styleByName } from '../../data/styles';
import { tourCategories, allTours, type MapTour } from '../../data/mapTours';
import { parseYear } from '../../lib/year';
import { toLatLng, toRegion } from '../../lib/coords';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

// Include the 1880s Jaffa/Ottoman anchor so the slider spans the earliest building → the latest.
const YEARS = buildings.map((b) => parseYear(b.year)).filter((y) => y >= 1850 && y <= 2100);
const MIN_YEAR = Math.min(...YEARS);
const MAX_YEAR = Math.max(...YEARS);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Bearing (degrees clockwise from north) from a → b. The map is north-up, so this also rotates the on-screen arrow. */
function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
const midpoint = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => ({
  lat: (a.lat + b.lat) / 2,
  lng: (a.lng + b.lng) / 2,
});

/** A direction arrow along the route that flashes to draw the eye onward. */
function FlashingArrow({ deg }: { deg: number }) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.Text style={[styles.arrowGlyph, st, { transform: [{ rotate: `${deg}deg` }] }]}>↑</Animated.Text>
  );
}

/** A soft pulsing ring marking the stop you're currently on. */
function CurrentRing() {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withRepeat(withTiming(1.8, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false);
  }, [s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: 2 - s.value }));
  return <Animated.View style={[styles.currentRing, st]} pointerEvents="none" />;
}

export default function FullScreenMap() {
  const { focus, tour: tourParam } = useLocalSearchParams<{ focus?: string; tour?: string }>();
  const focusBuilding = focus ? buildings.find((b) => String(b.id) === focus) : undefined;
  const mapRef = useRef<MapView>(null);

  const [year, setYear] = useState(MAX_YEAR);
  const [mode, setMode] = useState<'timeline' | 'category'>('timeline');
  const [periodName, setPeriodName] = useState<string | null>(null);
  const [trackH, setTrackH] = useState(0);
  const heightRef = useRef(0);

  // Tour state (auto-start when arriving with a ?tour= param from Field research)
  const [tourKey, setTourKey] = useState<string | null>(
    allTours.some((t) => t.key === tourParam) ? (tourParam as string) : null
  );
  const [stopIndex, setStopIndex] = useState(0);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const tour: MapTour | undefined = allTours.find((t) => t.key === tourKey);
  const openCategory = tourCategories.find((c) => c.key === openCat);
  const stops = useMemo(
    () =>
      (tour?.stopIds ?? [])
        .map((id) => buildings.find((b) => b.id === id))
        .filter((b): b is (typeof buildings)[number] => !!b),
    [tour]
  );
  const current = stops[stopIndex];

  const activePeriod = periodName ? styleByName(periodName) : undefined;

  const activeIds = useMemo(() => {
    const set = new Set<number>();
    for (const b of buildings) {
      if (mode === 'category') {
        const match = activePeriod?.matchStyles ?? [];
        if (!activePeriod || match.includes(b.style)) set.add(b.id);
      } else {
        const y = parseYear(b.year);
        if (y === 0 || y <= year) set.add(b.id);
      }
    }
    return set;
  }, [mode, activePeriod, year]);

  const frac = MAX_YEAR > MIN_YEAR ? clamp((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR), 0, 1) : 1;

  // Lead from stop to stop: fly the camera to the current stop.
  useEffect(() => {
    if (tour && current && mapRef.current) {
      mapRef.current.animateToRegion(toRegion(current.resolved, 16), 650);
    }
  }, [tourKey, stopIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTour = (t: MapTour) => {
    setTourKey(t.key);
    setStopIndex(0);
  };
  const exitTour = () => setTourKey(null);

  // Vertical track: top = latest, bottom = earliest.
  const yearFromY = (y: number) => {
    const h = heightRef.current || 1;
    const f = 1 - clamp(y / h, 0, 1);
    return Math.round(MIN_YEAR + f * (MAX_YEAR - MIN_YEAR));
  };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setYear(yearFromY(e.nativeEvent.locationY)),
      onPanResponderMove: (e) => setYear(yearFromY(e.nativeEvent.locationY)),
    })
  ).current;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    heightRef.current = e.nativeEvent.layout.height;
    setTrackH(e.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container}>
      <MapStyled
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={
          focusBuilding
            ? toRegion(focusBuilding.resolved, 16)
            : { latitude: 32.0668, longitude: 34.7752, latitudeDelta: 0.045, longitudeDelta: 0.045 }
        }
      >
        {/* Free-browse markers (hidden while a tour runs) */}
        {!tour &&
          buildings.map((building) => {
            const active = activeIds.has(building.id);
            return (
              <Marker
                key={building.id}
                coordinate={toLatLng(building.resolved)}
                opacity={active ? 1 : 0}
                tracksViewChanges={false}
                onPress={
                  active
                    ? () =>
                        router.push({ pathname: '/locating', params: { buildingId: String(building.id) } })
                    : undefined
                }
              >
                <View style={styles.marker} />
              </Marker>
            );
          })}

        {/* Tour route */}
        {tour && stops.length > 1 && (
          <Polyline
            coordinates={stops.map((s) => toLatLng(s.resolved))}
            strokeColor={colors.terracotta}
            strokeWidth={3}
            lineDashPattern={[8, 7]}
          />
        )}

        {/* Flashing direction arrows at each segment midpoint */}
        {tour &&
          stops.slice(0, -1).map((s, i) => {
            const a = s.resolved;
            const b = stops[i + 1].resolved;
            const mid = midpoint(a, b);
            return (
              <Marker
                key={`arrow-${s.id}`}
                coordinate={{ latitude: mid.lat, longitude: mid.lng }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                {...({ role: 'arrow', rotation: Math.round(bearing(a, b)) } as any)}
              >
                <FlashingArrow deg={bearing(a, b)} />
              </Marker>
            );
          })}

        {/* Numbered stops */}
        {tour &&
          stops.map((s, i) => (
            <Marker
              key={`stop-${s.id}`}
              coordinate={toLatLng(s.resolved)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              onPress={() => setStopIndex(i)}
              {...({ role: 'stop', label: String(i + 1) } as any)}
            >
              <View style={styles.stopPin}>
                <Text style={styles.stopNum}>{i + 1}</Text>
              </View>
            </Marker>
          ))}

        {/* Current-stop pulse */}
        {tour && current && (
          <Marker
            key="current"
            coordinate={toLatLng(current.resolved)}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            {...({ role: 'current' } as any)}
          >
            <CurrentRing />
          </Marker>
        )}
      </MapStyled>

      <BackButton onPress={() => (tour ? exitTour() : router.back())} />

      {/* Camera / AR viewfinder button (top-right) */}
      {!tour && (
        <Pressable
          style={({ pressed }) => [styles.cameraBtn, pressed && styles.pressedScale]}
          onPress={() => router.push('/ar')}
        >
          <View style={styles.camBump} />
          <View style={styles.camBody}>
            <View style={styles.camLens} />
          </View>
        </Pressable>
      )}

      {/* Left slider — only when free-browsing */}
      {!tour && (
        <View style={styles.controls} pointerEvents="box-none">
          <View style={styles.modeSwitch}>
            <Pressable onPress={() => setMode('timeline')} style={[styles.modeBtn, mode === 'timeline' && styles.modeOn]}>
              <Text style={[styles.modeText, mode === 'timeline' && styles.modeTextOn]}>Time</Text>
            </Pressable>
            <Pressable onPress={() => setMode('category')} style={[styles.modeBtn, mode === 'category' && styles.modeOn]}>
              <Text style={[styles.modeText, mode === 'category' && styles.modeTextOn]}>Style</Text>
            </Pressable>
          </View>

          {mode === 'timeline' ? (
            <View style={styles.sliderCol}>
              <Text style={styles.yearNow}>{year}</Text>
              <View style={styles.track} onLayout={onTrackLayout} {...responder.panHandlers}>
                <View style={styles.trackLine} />
                <View style={[styles.trackFill, { height: trackH * frac }]} />
                <View style={[styles.thumb, { top: clamp(trackH * (1 - frac) - 11, -2, trackH - 20) }]} />
              </View>
              <Text style={styles.yearEnd}>{MIN_YEAR}</Text>
            </View>
          ) : (
            <View style={styles.chips}>
              <Pressable onPress={() => setPeriodName(null)} style={[styles.chip, !activePeriod && styles.chipOn]}>
                <Text style={[styles.chipText, !activePeriod && styles.chipTextOn]}>All</Text>
              </Pressable>
              {timelineStyles.map((s) => {
                const on = activePeriod?.name === s.name;
                return (
                  <Pressable key={s.name} onPress={() => setPeriodName(s.name)} style={[styles.chip, on && styles.chipOn]}>
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Bottom: tour launcher (free-browse) or the stop-to-stop stepper (in a tour) */}
      {!tour ? (
        <View style={styles.tourBar} pointerEvents="box-none">
          <Text style={styles.tourBarLabel}>Guided tours</Text>
          {openCategory && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tourStrip}
              contentContainerStyle={styles.tourStripContent}
            >
              {openCategory.tours.map((t) => (
                <Pressable key={t.key} onPress={() => startTour(t)} style={styles.tourBtn}>
                  <Text style={styles.tourBtnName} numberOfLines={2}>{t.name}</Text>
                  <Text style={styles.tourBtnSub} numberOfLines={1}>{t.subtitle}</Text>
                  <Text style={styles.tourBtnCount}>{t.stopIds.length} stops ›</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={styles.catRow}>
            {tourCategories.map((c) => {
              const on = openCat === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setOpenCat(on ? null : c.key)}
                  style={[styles.catBtn, on && styles.catBtnOn]}
                >
                  <Text style={[styles.catName, on && styles.catNameOn]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{c.name}</Text>
                  <Text style={[styles.catBlurb, on && styles.catBlurbOn]} numberOfLines={1}>{c.blurb}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        current && (
          <View style={styles.stepper}>
            <View style={styles.stepperHead}>
              <Text style={styles.stepperTour}>{tour.name}</Text>
              <Pressable onPress={exitTour} hitSlop={10}>
                <Text style={styles.exitX}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.stopTitle}>
              {stopIndex + 1}/{stops.length} · {current.name}
            </Text>
            <Text style={styles.stopMeta}>
              {current.year} · {current.style} · {current.architect}
            </Text>
            <View style={styles.stepRow}>
              <Pressable
                onPress={() => setStopIndex((i) => Math.max(0, i - 1))}
                disabled={stopIndex === 0}
                style={[styles.stepBtn, stopIndex === 0 && styles.stepBtnOff]}
              >
                <Text style={styles.stepBtnText}>‹ Prev</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/locating', params: { buildingId: String(current.id) } })}
                style={[styles.stepBtn, styles.stepBtnPrimary]}
              >
                <Text style={[styles.stepBtnText, styles.stepBtnTextPrimary]}>Open</Text>
              </Pressable>
              <Pressable
                onPress={() => setStopIndex((i) => Math.min(stops.length - 1, i + 1))}
                disabled={stopIndex === stops.length - 1}
                style={[styles.stepBtn, stopIndex === stops.length - 1 && styles.stepBtnOff]}
              >
                <Text style={styles.stepBtnText}>Next ›</Text>
              </Pressable>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mapTile },
  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.white,
  },

  // Tour map graphics
  arrowGlyph: { fontSize: 22, color: colors.terracotta, fontWeight: '900', textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 3 },
  stopPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNum: { color: colors.white, fontWeight: '800', fontSize: 13 },
  currentRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: colors.terracotta,
    backgroundColor: 'rgba(180,86,47,0.18)',
  },

  controls: {
    position: 'absolute',
    left: 12,
    top: 96,
    bottom: 150,
    width: 146,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radii.circle,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.circle },
  modeOn: { backgroundColor: colors.terracotta },
  modeText: { ...ui.metadataSmall, color: colors.muted },
  modeTextOn: { color: colors.white },

  sliderCol: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 8 },
  yearNow: {
    ...ui.buttonLabel,
    color: colors.ink,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  yearEnd: { ...ui.metadataSmall, color: colors.ink, opacity: 0.7 },
  track: { width: 34, flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  trackLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  trackFill: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.terracotta,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.terracotta,
  },
  chips: { alignItems: 'stretch', gap: spacing.xs, width: '100%' },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
  },
  chipOn: { backgroundColor: colors.terracotta },
  chipText: { ...ui.metadataSmall, color: colors.inkSoft, fontSize: 11, textAlign: 'center' },
  chipTextOn: { color: colors.white },

  // Camera / AR button
  cameraBtn: {
    position: 'absolute',
    top: 52,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pressedScale: { transform: [{ scale: 1.06 }] },
  camBump: { width: 9, height: 4, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: colors.white, marginBottom: -1 },
  camBody: { width: 26, height: 17, borderRadius: 4, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  camLens: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.terracotta },

  // Bottom tour launcher
  tourBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
  },
  tourBarLabel: {
    ...ui.label,
    alignSelf: 'center',
    color: colors.terracotta,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(251,244,234,0.94)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.circle,
    overflow: 'hidden',
  },
  tourStrip: { marginBottom: 8, maxHeight: 82 },
  tourStripContent: { gap: spacing.sm, paddingHorizontal: 2 },
  catRow: { flexDirection: 'row', gap: spacing.sm },
  catBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  catBtnOn: { backgroundColor: colors.terracotta },
  catName: { ...editorial.cardTitle, fontSize: 15, color: colors.terracotta },
  catNameOn: { color: colors.white },
  catBlurb: { ...ui.metadataSmall, color: colors.muted, marginTop: 2, textAlign: 'center', lineHeight: 12 },
  catBlurbOn: { color: 'rgba(255,255,255,0.9)' },
  tourBtn: {
    width: 172,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  tourBtnName: { ...editorial.cardTitle, fontSize: 14, color: colors.terracotta },
  tourBtnSub: { ...ui.metadataSmall, color: colors.muted, marginTop: 3, lineHeight: 13 },
  tourBtnCount: { ...ui.label, color: colors.inkSoft, marginTop: 5, fontSize: 9 },

  // Stop-to-stop stepper
  stepper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  stepperHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepperTour: { ...ui.label, color: colors.terracotta },
  exitX: { ...ui.buttonLabel, color: colors.muted, fontSize: 15 },
  stopTitle: { ...editorial.cardTitleLg, color: colors.ink, marginTop: 4 },
  stopMeta: { ...ui.metadata, color: colors.muted, marginTop: 2 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  stepBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
  },
  stepBtnOff: { opacity: 0.4 },
  stepBtnPrimary: { backgroundColor: colors.terracotta },
  stepBtnText: { ...ui.buttonLabel, color: colors.inkSoft },
  stepBtnTextPrimary: { color: colors.white },
});
