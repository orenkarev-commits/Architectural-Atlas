import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * An organic living gradient that drifts between cream and sunset. A warm base sits
 * under two soft sunset "light" layers that slowly drift and breathe on offset timers
 * (eased sine, so the motion never looks mechanical). `opacity` fades the sunset layers
 * so the wash gets quieter the deeper you go into the app.
 *
 * variant "sunset" (the welcome screen): a deep base so cream text stays legible.
 * variant "warm" (inner screens): a cream base so dark text stays legible.
 */
const PAL = {
  sunset: {
    base: ['#E8632A', '#B4241A'] as const,
    b1: ['#F8B65C', '#E0602A'] as const,
    b2: ['#F2913C', '#9E1C12'] as const,
  },
  warm: {
    base: ['#FBF1E2', '#F2CBA0'] as const,
    b1: ['#F6CFA2', '#EC9A5A'] as const,
    b2: ['#FCE7CF', '#F3B986'] as const,
  },
};

export function MotionGradient({
  variant = 'sunset',
  opacity = 1,
  children,
  style,
}: {
  variant?: 'sunset' | 'warm';
  opacity?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const { width } = useWindowDimensions();
  const pal = PAL[variant];

  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);
  useEffect(() => {
    // offset, eased-sine loops → organic, non-synchronised drift
    a.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.sin) }), -1, true);
    c.value = withRepeat(withTiming(1, { duration: 19000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [a, b, c]);

  const s1 = useAnimatedStyle(() => ({
    opacity: (0.35 + 0.5 * a.value) * opacity,
    transform: [
      { translateX: -width * 0.25 + width * 0.5 * b.value },
      { translateY: -60 + 120 * a.value },
      { scale: 1.4 + 0.3 * c.value },
    ],
  }));
  const s2 = useAnimatedStyle(() => ({
    opacity: (0.3 + 0.45 * c.value) * opacity,
    transform: [
      { translateX: width * 0.3 - width * 0.55 * a.value },
      { translateY: 80 - 140 * c.value },
      { scale: 1.5 + 0.3 * b.value },
    ],
  }));

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={pal.base as any}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s1]}>
        <LinearGradient colors={pal.b1 as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s2]}>
        <LinearGradient colors={pal.b2 as any} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {children}
    </View>
  );
}
