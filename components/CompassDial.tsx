import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAtlas } from '../context/AtlasContext';
import { distanceKm } from '../lib/distance';
import { bearingDeg } from '../lib/bearing';
import { colors } from '../theme/tokens';
import { ui } from '../theme/typography';

const DIAL = 176;
const R = DIAL / 2;
const POINTER_LEN = 66; // center → needle tip
const TAIL_LEN = 15; // center → tail end
const HUB = 11;

type Located = { id: number; name: string; resolved: { lat: number; lng: number } };

const TWO_PI = Math.PI * 2;
const WOBBLE_PERIOD_MS = 2600;
// Fallback origin when the device gives no location (desktop web): central Tel
// Aviv. The needle still aims and wiggles — labelled so it is never mistaken for
// the viewer's own bearing.
const TLV_CENTER = { lat: 32.0757, lng: 34.7726 };

const TICKS = Array.from({ length: 60 }, (_, i) => i);

/**
 * A minimal Braun-watch compass. A fine minute-tick ring, a thin terracotta
 * needle over a faint Nolli-plan face, and a seamless two-harmonic wiggle so it
 * reads as a live instrument. Aims (north-up, no magnetometer) at the nearest of
 * the given buildings. `showDistance` on the architect's own page adds the km; the
 * index shows direction only.
 */
export function CompassDial({
  buildings,
  showDistance = true,
}: {
  buildings: Located[];
  showDistance?: boolean;
}) {
  const { userLocation, findNearMe, geoOffline } = useAtlas();
  const askedOnce = useRef(false);

  useEffect(() => {
    if (!askedOnce.current && !userLocation && !geoOffline) {
      askedOnce.current = true;
      void findNearMe();
    }
  }, [userLocation, geoOffline, findNearMe]);

  const origin = userLocation ?? TLV_CENTER;
  const approx = !userLocation;

  const nearest = useMemo(() => {
    if (buildings.length === 0) return null;
    let best: Located | null = null;
    let bestKm = Infinity;
    for (const b of buildings) {
      const km = distanceKm(origin, b.resolved);
      if (km < bestKm) {
        bestKm = km;
        best = b;
      }
    }
    if (!best) return null;
    return { building: best, km: bestKm, bearing: bearingDeg(origin, best.resolved) };
  }, [origin, buildings]);

  const aim = useSharedValue(0);
  const wob = useSharedValue(0);

  useEffect(() => {
    wob.value = withRepeat(
      withTiming(1, { duration: WOBBLE_PERIOD_MS, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(wob);
  }, [wob]);

  useEffect(() => {
    if (!nearest) return;
    const current = aim.value;
    const target = nearest.bearing + 360 * Math.round((current - nearest.bearing) / 360);
    aim.value = withTiming(target, { duration: 950, easing: Easing.out(Easing.cubic) });
  }, [nearest, aim]);

  const needleStyle = useAnimatedStyle(() => {
    const theta = wob.value * TWO_PI;
    const wobble = 3.2 * Math.sin(theta) + 1.4 * Math.sin(3 * theta + 0.9);
    return { transform: [{ rotate: `${aim.value + wobble}deg` }] };
  });

  const name = nearest?.building.name;
  const caption = !nearest
    ? 'Locating the nearest building…'
    : showDistance
    ? approx
      ? `${name} · ${formatKm(nearest.km)} from city centre`
      : `${name} · ${formatKm(nearest.km)}`
    : name;

  return (
    <View style={styles.wrap}>
      <View style={styles.dial}>
        <View style={styles.faceWash} />

        {/* minute-tick ring */}
        {TICKS.map((i) => {
          const major = i % 5 === 0;
          return (
            <View key={i} style={[styles.tickWrap, { transform: [{ rotate: `${i * 6}deg` }] }]}>
              <View style={major ? styles.tickMajor : styles.tickMinor} />
            </View>
          );
        })}
        <Text style={styles.north}>N</Text>

        {/* thin needle */}
        <Animated.View style={[styles.needleLayer, needleStyle]}>
          <View style={styles.pointer} />
          <View style={styles.tail} />
        </Animated.View>
        <View style={styles.hub}>
          <View style={styles.hubDot} />
        </View>

        <View style={styles.ring} pointerEvents="none" />
      </View>

      <Pressable onPress={() => { if (approx) void findNearMe(); }}>
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      </Pressable>
    </View>
  );
}

function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const INK = 'rgba(43,40,38,';

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  dial: {
    width: DIAL,
    height: DIAL,
    borderRadius: R,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FBF8F4',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: R,
    borderWidth: 1,
    borderColor: INK + '0.14)',
  },
  // Each wrap fills the dial and centres its tick at the top; rotating the wrap
  // sweeps the tick to its minute position on the rim.
  tickWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 7,
  },
  tickMinor: { width: 1, height: 5, borderRadius: 1, backgroundColor: INK + '0.22)' },
  tickMajor: { width: 1.5, height: 9, borderRadius: 1, backgroundColor: INK + '0.5)' },
  north: {
    position: 'absolute',
    top: 19,
    ...ui.metadataSmall,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.muted,
  },
  needleLayer: {
    position: 'absolute',
    width: DIAL,
    height: DIAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    position: 'absolute',
    width: 2.5,
    height: POINTER_LEN,
    top: R - POINTER_LEN,
    left: R - 1.25,
    backgroundColor: colors.terracotta,
    borderRadius: 1.5,
  },
  tail: {
    position: 'absolute',
    width: 2.5,
    height: TAIL_LEN,
    top: R,
    left: R - 1.25,
    backgroundColor: INK + '0.4)',
    borderRadius: 1.5,
  },
  hub: {
    position: 'absolute',
    width: HUB,
    height: HUB,
    borderRadius: HUB / 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: INK + '0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.terracotta },
  caption: {
    ...ui.metadataSmall,
    color: colors.muted,
    textAlign: 'center',
  },
});
