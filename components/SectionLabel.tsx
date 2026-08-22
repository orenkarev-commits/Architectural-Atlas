import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { ui } from '../theme/typography';

export function SectionLabel({ children, style }: { children: string; style?: TextStyle }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...ui.label,
    color: colors.label,
  },
});
