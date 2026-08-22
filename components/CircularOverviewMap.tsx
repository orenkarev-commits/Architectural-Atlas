import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapStyled } from './MapStyled';
import type { Building } from '../data/types';
import { toLatLng } from '../lib/coords';
import { colors, shadows } from '../theme/tokens';
import { ui } from '../theme/typography';

const SIZE = 300;
const EDGE_PADDING = { top: 46, right: 46, bottom: 46, left: 46 };

export function CircularOverviewMap({
  buildings,
  frameBuildings,
  onSelect,
}: {
  buildings: Building[];
  /** Fit the view to this fixed set (defaults to `buildings`) so the frame stays
      stable while the visible markers emerge/filter within it. */
  frameBuildings?: Building[];
  onSelect: (building: Building) => void;
}) {
  const mapRef = useRef<MapView>(null);
  const frame = frameBuildings ?? buildings;

  return (
    <View style={styles.wrap}>
      <View style={styles.circleClip}>
        <MapStyled
          ref={mapRef}
          style={styles.map}
          onMapReady={() => {
            mapRef.current?.fitToCoordinates(
              frame.map((b) => toLatLng(b.resolved)),
              { edgePadding: EDGE_PADDING, animated: false }
            );
          }}
        >
          {buildings.map((building) => (
            <Marker
              key={building.id}
              coordinate={toLatLng(building.resolved)}
              onPress={() => onSelect(building)}
              tracksViewChanges={false}
            >
              <View style={styles.dot} />
            </Marker>
          ))}
        </MapStyled>
      </View>
      {/* Circular mask clips Google's own attribution — this caption is a
          licensing requirement, not decoration. Keep it. */}
      <Text style={styles.attribution}>Map data ©Google · Terms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circleClip: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
    ...shadows.mapCircle,
  },
  map: {
    width: SIZE,
    height: SIZE,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.white,
  },
  attribution: {
    ...ui.label,
    fontSize: 10,
    color: colors.muted,
    marginTop: 10,
  },
});
