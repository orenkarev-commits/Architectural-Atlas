import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { timelineStyles, conceptStyles } from '../data/styles';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * A time slider from the earliest building to the latest. Dragging the handle
 * reveals the city chronologically; each movement's button lights up as the
 * playhead passes the year it emerged — an indicator of when Eclectic gives way
 * to Art Deco, Bauhaus and the International Style — and taps through to its page.
 */
export function StyleTimeline({
  minYear,
  maxYear,
  year,
  onYearChange,
}: {
  minYear: number;
  maxYear: number;
  year: number;
  onYearChange: (y: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const widthRef = useRef(0);

  const frac = maxYear > minYear ? clamp((year - minYear) / (maxYear - minYear), 0, 1) : 0;

  // The most recently emerged movement at the current year — the era the slider is standing in.
  const leadStyle = timelineStyles
    .filter((s) => year >= s.emerges)
    .sort((a, b) => b.emerges - a.emerges)[0];

  const yearFromX = (x: number) => {
    const w = widthRef.current || 1;
    const f = clamp(x / w, 0, 1);
    return Math.round(minYear + f * (maxYear - minYear));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => onYearChange(yearFromX(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => onYearChange(yearFromX(e.nativeEvent.locationX)),
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={styles.yearNow}>{year}</Text>
        <Text style={styles.range}>
          {minYear} – {maxYear}
        </Text>
      </View>

      {/* draggable track */}
      <View style={styles.trackArea} onLayout={onLayout} {...responder.panHandlers}>
        <View style={styles.track} />
        <View style={[styles.trackFill, { width: trackWidth * frac }]} />
        <View style={[styles.thumb, { left: clamp(trackWidth * frac - 11, -2, trackWidth - 20) }]} />
      </View>

      {/* the style that leads at the current year — a quiet caption, not a button row */}
      {leadStyle ? (
        <Pressable
          onPress={() => router.push({ pathname: '/style/[name]', params: { name: leadStyle.name } })}
          style={({ pressed }) => [styles.leadRow, pressed && styles.pressed]}
        >
          <Text style={styles.leadLabel}>Emerging</Text>
          <Text style={styles.leadName}>{leadStyle.name}</Text>
          <Text style={styles.leadYear}>from {leadStyle.emerges}</Text>
        </Pressable>
      ) : null}

      {/* cross-cutting ideas */}
      <View style={styles.concepts}>
        <Text style={styles.conceptLabel}>Key ideas</Text>
        {conceptStyles.map((s) => (
          <Pressable
            key={s.name}
            onPress={() => router.push({ pathname: '/style/[name]', params: { name: s.name } })}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Text style={styles.chipText}>{s.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, marginBottom: spacing.xl },
  headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  yearNow: { ...editorial.architectName, fontSize: 30, color: colors.ink },
  range: { ...ui.metadataSmall, color: colors.muted },
  trackArea: { height: 34, justifyContent: 'center' },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.hairline,
  },
  trackFill: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.terracotta,
  },
  tick: {
    position: 'absolute',
    top: 12,
    width: 4,
    height: 10,
    borderRadius: 2,
  },
  tickOn: { backgroundColor: colors.terracotta },
  tickOff: { backgroundColor: colors.hairline },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.terracotta,
  },
  leadRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  leadLabel: { ...ui.label, color: colors.label },
  leadName: { ...editorial.cardTitle, fontSize: 16, color: colors.terracotta },
  leadYear: { ...ui.metadataSmall, color: colors.muted },
  pressed: { transform: [{ translateY: -1 }] },
  concepts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  conceptLabel: { ...ui.label, color: colors.label, marginRight: spacing.xs },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: 5,
    borderRadius: radii.circle,
    backgroundColor: colors.surfaceTint,
  },
  chipText: { ...ui.metadataSmall, color: colors.inkSoft },
});
