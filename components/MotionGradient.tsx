import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientDrift } from '../theme/tokens';

// Light "warm" states keep dark text legible (Stories, Architects); the sunset states are the
// red-orange welcome palette.
const WARM: ReadonlyArray<readonly [string, string]> = [
  ['#FBF4EA', '#F0C9A8'],
  ['#FDEFE0', '#EFC9A4'],
  ['#F7EDDA', '#F2C7A0'],
];

/**
 * A living gradient that both cross-fades between states and slowly pans across the screen
 * (motion skill). Wraps its children; the gradient sits behind them. `variant` picks the palette.
 */
export function MotionGradient({
  variant = 'sunset',
  children,
  style,
}: {
  variant?: 'sunset' | 'warm';
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const states = variant === 'sunset' ? gradientDrift : WARM;
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const pan = useSharedValue(0);

  useEffect(() => {
    a.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.ease) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.ease) }), -1, true);
    pan.value = withRepeat(withTiming(1, { duration: 17000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [a, b, pan]);

  // Oversized (scale 1.25) so the pan never reveals an edge.
  const sPan = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(pan.value, [0, 1], [-44, 44]) },
      { translateY: interpolate(pan.value, [0, 1], [26, -26]) },
      { scale: 1.25 },
    ],
  }));
  const sA = useAnimatedStyle(() => ({ opacity: a.value }));
  const sB = useAnimatedStyle(() => ({ opacity: b.value }));

  return (
    <View style={[{ flex: 1 }, style]}>
      {/* Base gradient — always painted, never transformed, so it can't disappear. */}
      <LinearGradient
        colors={states[0] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Drifting + panning layers on top. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sPan]}>
        <Animated.View style={[StyleSheet.absoluteFill, sA]}>
          <LinearGradient colors={states[1] as any} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, sB]}>
          <LinearGradient colors={(states[2] ?? states[0]) as any} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Animated.View>
      {children}
    </View>
  );
}
