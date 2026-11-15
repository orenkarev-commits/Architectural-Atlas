import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import MapView from 'react-native-maps';
import { MapStyled } from '../components/MapStyled';
import { LocatingPin } from '../components/LocatingPin';
import { buildings } from '../data/buildings';
import { toRegion } from '../lib/coords';
import { colors, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

// Most devices cap out around zoom 20 — the design's authored "zoom 11, +4,
// +6" sequence (11 -> 15 -> 21) is clamped at the top end for compatibility.
const MAX_ZOOM = 20;

export default function Locating() {
  const { buildingId } = useLocalSearchParams<{ buildingId: string }>();
  const building = buildings.find((b) => String(b.id) === buildingId);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!building) return;

    const step1 = setTimeout(() => {
      mapRef.current?.animateToRegion({ ...toRegion(building.resolved, 15) }, 600);
    }, 500);

    const step2 = setTimeout(() => {
      mapRef.current?.animateToRegion({ ...toRegion(building.resolved, Math.min(21, MAX_ZOOM)) }, 700);
    }, 1100);

    const commit = setTimeout(() => {
      router.replace({ pathname: '/building/[id]', params: { id: String(building.id) } });
    }, 2000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(commit);
    };
  }, [building]);

  if (!building) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MapStyled
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={toRegion(building.resolved, 11)}
      />
      <View style={styles.pinWrap} pointerEvents="none">
        <LocatingPin />
      </View>
      <LinearGradient
        colors={['transparent', colors.chrome]}
        locations={[0, 0.42]}
        style={styles.scrim}
      >
        <Text style={styles.label}>Locating</Text>
        <Text style={styles.name}>{building.name}</Text>
        <Text style={styles.address}>{building.address}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapTile,
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
    paddingTop: 80,
  },
  label: {
    ...ui.label,
    color: colors.muted,
  },
  name: {
    ...editorial.architectName,
    fontSize: 26,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  address: {
    ...ui.metadata,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
