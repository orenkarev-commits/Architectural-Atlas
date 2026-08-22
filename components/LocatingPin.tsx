import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

const PIN_DROP_MS = 900;
const PULSE_MS = 1600;
const PULSE_DELAY_MS = 550;

function PulseRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.ease) }), -1, false)
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.6, 2.6]);
    const opacity = interpolate(progress.value, [0, 1], [0.55, 0]);
    return { transform: [{ scale }], opacity };
  });

  return <Animated.View style={[styles.ring, style]} />;
}

/** The app's signature marker: two pulseRings behind a teardrop running pinDrop. */
export function LocatingPin() {
  const translateY = useSharedValue(-28);
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const settleMs = PIN_DROP_MS * 0.55;
    const overshootMs = PIN_DROP_MS * 0.15;
    const restMs = PIN_DROP_MS * 0.3;
    const overshootEasing = Easing.bezier(0.34, 1.4, 0.5, 1);

    translateY.value = withSequence(
      withTiming(0, { duration: settleMs, easing: overshootEasing }),
      withTiming(-8, { duration: overshootMs, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: restMs, easing: Easing.out(Easing.ease) })
    );
    scale.value = withTiming(1, { duration: settleMs, easing: overshootEasing });
    opacity.value = withTiming(1, { duration: settleMs });
  }, [translateY, scale, opacity]);

  const pinStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }, { rotate: '-45deg' }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <PulseRing delay={0} />
      <PulseRing delay={PULSE_DELAY_MS} />
      <Animated.View style={[styles.teardrop, pinStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.terracotta,
  },
  teardrop: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: colors.terracotta,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
  },
});
