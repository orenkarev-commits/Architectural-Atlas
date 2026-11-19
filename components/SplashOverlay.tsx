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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  nolliSource,
  NOLLI_PLAN_WIDTH,
  NOLLI_PLAN_HEIGHT,
  NOLLI_EPI,
  NOLLI_TRAVEL,
} from '../data/nolli';
import { editorial, ui } from '../theme/typography';

const CREAM = '#fbf3ea';
const TWO_PI = Math.PI * 2;
const PLAN_RATIO = NOLLI_PLAN_WIDTH / NOLLI_PLAN_HEIGHT;
const DRIFT_SECONDS = 44;

/** The Beit Alfes pointed-arch front — the Atlas mark, drawn from the building. */
function AlfesMark({ size = 118 }: { size?: number }) {
  const p = {
    stroke: CREAM,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d="M30 96 V46 H90 V96" strokeWidth={6} {...p} />
      <Path
        d="M30 46 V40 H38 V46 M46 46 V40 H54 V46 M62 46 V40 H70 V46 M78 46 V40 H86 V46"
        strokeWidth={4.2}
        {...p}
      />
      <Path d="M52 96 V70 Q52 54 60 50 Q68 54 68 70 V96" strokeWidth={6} {...p} />
      <Path d="M38 96 V76 Q38 66 43 63 Q48 66 48 76 V96" strokeWidth={4.2} {...p} />
      <Path d="M72 96 V76 Q72 66 77 63 Q82 66 82 76 V96" strokeWidth={4.2} {...p} />
    </Svg>
  );
}

/**
 * Launch splash: the Nolli figure-ground plan of Tel Aviv drifts faintly (15%)
 * over the Sunset gradient, while the Beit Alfes mark pops in, a rule strikes,
 * and the title rises in the app's Madimi One face. Holds briefly, then fades.
 */
export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();

  const planH = H * 1.75;
  const planW = planH * PLAN_RATIO;
  const roomX = (Math.max(0, (planW - W) / 2) * NOLLI_TRAVEL) || 0;
  const roomY = (Math.max(0, (planH - H) / 2) * NOLLI_TRAVEL) || 0;

  const progress = useSharedValue(0.4);
  const markO = useSharedValue(0);
  const markS = useSharedValue(0.86);
  const ruleW = useSharedValue(0);
  const wordO = useSharedValue(0);
  const wordY = useSharedValue(10);
  const wrapO = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1.4, { duration: DRIFT_SECONDS * 1000, easing: Easing.linear }),
      -1,
      false
    );
    markO.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) });
    markS.value = withTiming(1, { duration: 760, easing: Easing.out(Easing.back(1.4)) });
    ruleW.value = withDelay(700, withTiming(64, { duration: 500, easing: Easing.out(Easing.ease) }));
    wordO.value = withDelay(860, withTiming(1, { duration: 560, easing: Easing.out(Easing.ease) }));
    wordY.value = withDelay(860, withTiming(0, { duration: 560, easing: Easing.out(Easing.ease) }));
    wrapO.value = withDelay(1900, withTiming(0, { duration: 560, easing: Easing.inOut(Easing.ease) }));
    const t = setTimeout(onDone, 2520);
    return () => clearTimeout(t);
  }, [onDone, progress, markO, markS, ruleW, wordO, wordY, wrapO]);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: wrapO.value }));
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
  const markStyle = useAnimatedStyle(() => ({
    opacity: markO.value,
    transform: [{ scale: markS.value }],
  }));
  const ruleStyle = useAnimatedStyle(() => ({ width: ruleW.value }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordO.value,
    transform: [{ translateY: wordY.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, wrapStyle]} pointerEvents="none">
      <LinearGradient
        colors={['#ef6b3c', '#b4241a']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {nolliSource ? (
        <View style={styles.nolliClip}>
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
      <View style={styles.center}>
        <Animated.View style={markStyle}>
          <AlfesMark size={118} />
        </Animated.View>
        <Animated.View style={[styles.rule, ruleStyle]} />
        <Animated.View style={[styles.word, wordStyle]}>
          <Text style={styles.the}>THE</Text>
          <Text style={styles.title}>Architectural Atlas</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 100, elevation: 100, backgroundColor: '#b4241a' },
  nolliClip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', opacity: 0.15 },
  planWrap: { position: 'absolute' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  rule: { height: 2, borderRadius: 1, backgroundColor: 'rgba(251,243,234,0.7)' },
  word: { alignItems: 'center' },
  the: { ...ui.label, color: 'rgba(251,243,234,0.82)', letterSpacing: 3, marginBottom: 5 },
  title: { ...editorial.welcomeTitle, fontSize: 30, lineHeight: 34, color: CREAM, textAlign: 'center' },
});
