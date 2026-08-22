import React, { useEffect, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  NOLLI_EPI,
  NOLLI_PERIOD_SECONDS,
  NOLLI_PLAN_HEIGHT,
  NOLLI_PLAN_WIDTH,
  NOLLI_TRAVEL,
  nolliSource,
} from '../data/nolli';
import { colors, radii, spacing } from '../theme/tokens';
import { ui } from '../theme/typography';

const BAND_HEIGHT = 210;
const TWO_PI = Math.PI * 2;

/**
 * The Nolli plan of Tel Aviv, drawn well oversized and drifting through a slow
 * wandering path so the band reads as a window onto a much larger city.
 *
 * The path is a sum of harmonics of one base frequency:
 *
 *   x = a₁·sin(θ) + a₂·sin(2θ + φ)
 *   y = b₁·cos(θ) + b₂·cos(3θ + ψ)
 *
 * Because every term is a whole multiple of θ, the whole path closes exactly
 * once per period — two minutes — while the 1:2 and 1:3 ratios and the phase
 * offsets keep it circular but off-centre, so it never looks like it is
 * retracing a loop.
 *
 * Amplitudes are derived from the measured band size and capped by
 * `NOLLI_TRAVEL`, so the plan's edges never enter frame. No tiling, no seam.
 */
export function NolliBand() {
  const [bandWidth, setBandWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!nolliSource) return;
    progress.value = withRepeat(
      withTiming(1, { duration: NOLLI_PERIOD_SECONDS * 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const onLayout = (e: LayoutChangeEvent) => setBandWidth(e.nativeEvent.layout.width);

  // Half the surplus in each direction is how far the centre may travel.
  const roomX = Math.max(0, (NOLLI_PLAN_WIDTH - bandWidth) / 2) * NOLLI_TRAVEL;
  const roomY = Math.max(0, (NOLLI_PLAN_HEIGHT - BAND_HEIGHT) / 2) * NOLLI_TRAVEL;

  const driftStyle = useAnimatedStyle(() => {
    const { A, B, k, phase } = NOLLI_EPI;
    const theta = progress.value * TWO_PI;
    const span = A + B;
    // Epicycle: never stalls, because neither term's speed can cancel the other.
    const u = A * Math.cos(theta) + B * Math.cos(k * theta + phase);
    const v = A * Math.sin(theta) + B * Math.sin(k * theta + phase);
    return {
      transform: [
        { translateX: (roomX * u) / span },
        { translateY: (roomY * v) / span },
      ],
    };
  }, [roomX, roomY]);

  if (!nolliSource) {
    return (
      <View style={[styles.band, styles.pendingBand]}>
        <Text style={styles.pending}>Nolli plan of Tel Aviv — asset pending</Text>
      </View>
    );
  }

  return (
    <View style={styles.band} onLayout={onLayout}>
      {bandWidth > 0 ? (
        <Animated.View
          style={[
            styles.planWrap,
            {
              left: (bandWidth - NOLLI_PLAN_WIDTH) / 2,
              top: (BAND_HEIGHT - NOLLI_PLAN_HEIGHT) / 2,
            },
            driftStyle,
          ]}
        >
          <Image source={nolliSource} style={styles.plan} resizeMode="cover" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    height: BAND_HEIGHT,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    backgroundColor: colors.darkSurface,
  },
  pendingBand: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  pending: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  planWrap: {
    position: 'absolute',
    width: NOLLI_PLAN_WIDTH,
    height: NOLLI_PLAN_HEIGHT,
  },
  plan: {
    width: NOLLI_PLAN_WIDTH,
    height: NOLLI_PLAN_HEIGHT,
  },
});
