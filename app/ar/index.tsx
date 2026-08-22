import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { BackButton } from '../../components/BackButton';
import { buildings } from '../../data/buildings';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

const RANGE_M = 500; // label buildings within this distance
const HALF_FOV = 34; // degrees to each side of where the phone points
const MAX_LABELS = 6;

type Coord = { lat: number; lng: number };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function haversine(a: Coord, b: Coord) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dφ = toRad(b.lat - a.lat);
  const dλ = toRad(b.lng - a.lng);
  const x =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
/** Bearing (deg clockwise from north) from a → b. */
function bearing(a: Coord, b: Coord) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
/** Signed smallest angle target−ref, in [-180, 180]. */
const angDiff = (target: number, ref: number) => ((target - ref + 540) % 360) - 180;

export default function ARViewfinder() {
  const { width } = useWindowDimensions();
  const [perm, requestPerm] = useCameraPermissions();
  const [coord, setCoord] = useState<Coord | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [locOk, setLocOk] = useState(false);

  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain) requestPerm();
  }, [perm, requestPerm]);

  useEffect(() => {
    let posSub: Location.LocationSubscription | undefined;
    let headSub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setLocOk(true);
      posSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 3 },
        (p) => setCoord({ lat: p.coords.latitude, lng: p.coords.longitude })
      );
      headSub = await Location.watchHeadingAsync((h) =>
        setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading)
      );
    })();
    return () => {
      posSub?.remove();
      headSub?.remove();
    };
  }, []);

  const labels = useMemo(() => {
    if (!coord || heading == null) return [];
    return buildings
      .map((b) => ({ b, d: haversine(coord, b.resolved), off: angDiff(bearing(coord, b.resolved), heading) }))
      .filter((x) => x.d <= RANGE_M && Math.abs(x.off) <= HALF_FOV)
      .sort((a, b) => a.d - b.d)
      .slice(0, MAX_LABELS);
  }, [coord, heading]);

  const hint = !perm?.granted
    ? 'Grant camera access to begin'
    : !locOk
    ? 'Grant location access to place buildings'
    : heading == null
    ? 'Move your phone in a figure-8 to calibrate the compass'
    : labels.length
    ? 'Point at a building to see what it is'
    : 'No Atlas buildings in view — turn around or walk closer';

  return (
    <View style={styles.container}>
      {perm?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}

      {labels.map(({ b, off }, i) => {
        const x = width / 2 + (off / HALF_FOV) * (width / 2 - 80);
        return (
          <Pressable
            key={b.id}
            style={[styles.label, { left: clamp(x - 80, 8, width - 160), top: 120 + i * 60 }]}
            onPress={() => router.push({ pathname: '/locating', params: { buildingId: String(b.id) } })}
          >
            <View style={styles.namePill}>
              <Text style={styles.labelName} numberOfLines={1}>{b.name}</Text>
            </View>
            <View style={styles.arrowHead} />
          </Pressable>
        );
      })}

      <BackButton onPress={() => router.back()} />

      <View style={styles.hintBar} pointerEvents="none">
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14110F' },
  fallback: { backgroundColor: '#14110F' },
  label: {
    position: 'absolute',
    width: 160,
    alignItems: 'center',
  },
  namePill: {
    maxWidth: 160,
    backgroundColor: 'rgba(20,17,15,0.7)',
    borderRadius: radii.circle,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelName: { ...editorial.cardTitle, fontSize: 14, color: colors.white, textAlign: 'center' },
  // An open (outline) arrowhead pointing down at the building.
  arrowHead: {
    width: 13,
    height: 13,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.terracotta,
    transform: [{ rotate: '45deg' }],
    marginTop: 5,
  },
  hintBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 34,
    backgroundColor: 'rgba(20,17,15,0.7)',
    borderRadius: radii.circle,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  hintText: { ...ui.metadata, color: colors.white, textAlign: 'center' },
});
