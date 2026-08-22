import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { SectionLabel } from '../../components/SectionLabel';
import { styleByName } from '../../data/styles';
import { buildings } from '../../data/buildings';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

export default function StylePage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const entry = name ? styleByName(name) : undefined;
  if (!entry) return null;

  const match = entry.matchStyles ?? (entry.filterStyle ? [entry.filterStyle] : []);
  const inAtlas = buildings.filter((b) => match.includes(b.style));

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{entry.kind === 'concept' ? 'Key idea' : 'Style'}</Text>
        <Text style={styles.name}>{entry.name}</Text>
        <Text style={styles.span}>{entry.span}</Text>
        <Text style={styles.tagline}>{entry.tagline}</Text>

        <View style={styles.section}>
          <SectionLabel>History</SectionLabel>
          <Text style={styles.prose}>{entry.history}</Text>
        </View>

        <View style={styles.section}>
          <SectionLabel>Notable aspects</SectionLabel>
          <View style={styles.hallmarks}>
            {entry.hallmarks.map((h) => (
              <View key={h} style={styles.hallmarkRow}>
                <View style={styles.dot} />
                <Text style={styles.hallmarkText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        {inAtlas.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>{`In the atlas (${inAtlas.length})`}</SectionLabel>
            <View style={styles.atlasList}>
              {inAtlas.map((b) => (
                <Pressable
                  key={b.id}
                  style={({ pressed }) => [styles.atlasRow, pressed && styles.pressed]}
                  onPress={() =>
                    router.push({ pathname: '/locating', params: { buildingId: String(b.id) } })
                  }
                >
                  <Image source={b.image} style={styles.thumb} />
                  <View style={styles.atlasText}>
                    <Text style={styles.atlasName}>{b.name}</Text>
                    <Text style={styles.atlasMeta}>
                      {b.architect} · {b.year}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.xxl, paddingTop: 104, paddingBottom: spacing.huge, gap: spacing.md },
  kicker: { ...ui.label, color: colors.terracotta },
  name: { ...editorial.architectName, color: colors.ink },
  span: { ...ui.metadata, color: colors.muted },
  tagline: { ...editorial.cardTitle, color: colors.inkSoft, marginTop: spacing.xs },
  section: { gap: spacing.sm, marginTop: spacing.lg },
  prose: { ...ui.body, color: colors.body },
  hallmarks: { gap: spacing.sm },
  hallmarkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.terracotta,
    marginTop: 8,
  },
  hallmarkText: { ...ui.body, color: colors.body, flex: 1 },
  atlasList: { gap: spacing.base },
  atlasRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  pressed: { opacity: 0.85 },
  thumb: { width: 52, height: 64, borderRadius: radii.xs },
  atlasText: { flex: 1 },
  atlasName: { ...editorial.cardTitle, fontSize: 15, color: colors.inkSoft },
  atlasMeta: { ...ui.metadataSmall, color: colors.muted, marginTop: 2 },
});
