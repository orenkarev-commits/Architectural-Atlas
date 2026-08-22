import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../components/BackButton';
import { buildings } from '../data/buildings';
import { parseYear } from '../lib/year';
import { colors, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const withMaterials = [...buildings]
  .filter((b) => !!b.materials)
  .sort((a, b) => (parseYear(a.year) || Infinity) - (parseYear(b.year) || Infinity));

export default function Materials() {
  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Atlas</Text>
        <Text style={styles.name}>Materials & construction</Text>
        <Text style={styles.tagline}>
          How the city was built — documented materials and methods, oldest first. Only where sourced.
        </Text>

        {withMaterials.map((b) => (
          <Pressable
            key={b.id}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/locating', params: { buildingId: String(b.id) } })}
          >
            <View style={styles.bulletHead}>
              <View style={styles.bullet} />
              <Text style={styles.itemName}>{b.name}</Text>
            </View>
            <Text style={styles.itemMeta}>
              {b.year} · {b.style}
            </Text>
            <Text style={styles.prose}>{b.materials}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 104,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  kicker: { ...ui.label, color: colors.terracotta },
  name: { ...editorial.architectName, color: colors.ink },
  tagline: { ...editorial.cardTitle, color: colors.inkSoft, marginTop: spacing.xs },
  item: { gap: 4, marginTop: spacing.lg },
  pressed: { opacity: 0.85 },
  bulletHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.terracotta },
  itemName: { ...editorial.cardTitle, fontSize: 16, color: colors.terracotta, flex: 1 },
  itemMeta: { ...ui.metadataSmall, color: colors.muted, marginLeft: 14 },
  prose: { ...ui.body, color: colors.body, marginTop: 2, marginLeft: 14 },
});
