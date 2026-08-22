import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  nolliSource,
  NOLLI_PLAN_WIDTH,
  NOLLI_PLAN_HEIGHT,
  NOLLI_EPI,
  NOLLI_TRAVEL,
} from '../data/nolli';
import { colors } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const WARM = '#FBF4EA';
const TWO_PI = Math.PI * 2;
const PLAN_RATIO = NOLLI_PLAN_WIDTH / NOLLI_PLAN_HEIGHT; // 1.79, matches the source
const DRIFT_SECONDS = 44; // slow, continuous drift while the splash is up

/**
 * Launch splash: the Nolli figure-ground plan of Tel Aviv drawn well oversized
 * and drifting through a continuous epicyclic path — the same effect as the
 * Field-research band, but full-screen — so it reads as a window onto the whole
 * city. A warm scrim carries the title in the app's Newsreader-italic face.
 * Holds briefly, then fades to reveal the app.
 */
export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();

  // Draw the plan much larger than the screen in both directions, so the camera
  // has room to travel without ever exposing an edge (as in the band).
  const planH = H * 1.75;
  const planW = planH * PLAN_RATIO;
  const roomX = (Math.max(0, (planW - W) / 2) * NOLLI_TRAVEL) || 0;
  const roomY = (Math.max(0, (planH - H) / 2) * NOLLI_TRAVEL) || 0;

  const progress = useSharedValue(0.4);
  const wrapOpacity = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(12);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1.4, { duration: DRIFT_SECONDS * 1000, easing: Easing.linear }),
      -1,
      false
    );
    titleOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    titleY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
    wrapOpacity.value = withDelay(1650, withTiming(0, { duration: 550, easing: Easing.inOut(Easing.ease) }));
    // Unmount via a plain timer (reliable across platforms) once the fade is done.
    const timer = setTimeout(onDone, 2250);
    return () => clearTimeout(timer);
  }, [onDone, progress, wrapOpacity, titleOpacity, titleY]);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: wrapOpacity.value }));
  const driftStyle = useAnimatedStyle(() => {
    const { A, B, k, phase } = NOLLI_EPI;
    const theta = progress.value * TWO_PI;
    const span = A + B;
    const u = A * Math.cos(theta) + B * Math.cos(k * theta + phase);
    const v = A * Math.sin(theta) + B * Math.sin(k * theta + phase);
    return {
      transform: [
        { translateX: (roomX * u) / span },
        { translateY: (roomY * v) / span },
      ],
    };
  }, [roomX, roomY]);
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, wrapStyle]} pointerEvents="none">
      {nolliSource ? (
        <View style={styles.clip}>
          <Animated.View
            style={[
              styles.planWrap,
              { width: planW, height: planH, left: (W - planW) / 2, top: (H - planH) / 2 },
              driftStyle,
            ]}
          >
            <Image source={nolliSource} style={{ width: planW, height: planH }} resizeMode="cover" />
          </Animated.View>
        </View>
      ) : null}
      <View style={styles.scrim} />
      <Animated.View style={[styles.center, titleStyle]}>
        <Text style={styles.title}>Architectural Atlas</Text>
        <Text style={styles.subtitle}>Tel Aviv, building by building</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: WARM, zIndex: 100, elevation: 100 },
  clip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  planWrap: { position: 'absolute' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(251,244,234,0.62)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { ...editorial.welcomeTitle, color: colors.ink, textAlign: 'center' },
  subtitle: { ...ui.label, color: colors.terracotta, marginTop: 14, letterSpacing: 1.6 },
});
