import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradient } from '../theme/tokens';

// 160deg linear-gradient approximated as a diagonal start/end vector.
const START = { x: 0.28, y: 0 };
const END = { x: 0.72, y: 1 };

/** Full-screen gradient wrapper — lays out children normally (flex: 1), does not float above them. */
export function GradientBackground({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient colors={gradient.colors} start={START} end={END} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}
