import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * A collapsible "bubble" — the terracotta-strip treatment of the research
 * thread, with a bold title that toggles open on tap. Keeps a building page
 * clean: every section is closed until the reader opens it.
 */
export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };
  return (
    <View style={styles.bubble}>
      <Pressable onPress={toggle} style={styles.header} hitSlop={4}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.chevron, open && styles.chevronOpen]}>⌄</Text>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: colors.bubble,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...editorial.cardTitle,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  chevron: {
    ...ui.body,
    fontSize: 20,
    lineHeight: 20,
    color: colors.terracotta,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: 2,
    gap: spacing.md,
  },
});
