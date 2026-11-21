import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../components/BackButton';
import { buildings } from '../data/buildings';
import { parseYear } from '../lib/year';
import { colors, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

// Only genuine, sourced firsts — a first or a true innovation for the city,
// the country, or the world. Not a personal "first building", not a trivial
// "first on the block". Each carries a one-line claim; the prose expands it.
const FIRSTS: { id: number; claim: string }[] = [
  { id: 2, claim: 'First Tel Aviv houses raised on pilotis — the empty ground reasoned as public shade' },
  { id: 3, claim: 'Reputedly the first passenger lift in a private Tel Aviv home' },
  { id: 12, claim: "Tel Aviv's first power station" },
  { id: 18, claim: 'Likely the only plaza in the world planned on Bauhaus principles' },
  { id: 19, claim: 'First in the country to trade the ribbon window for a deep recessed balcony' },
  { id: 20, claim: "The country's first central air-conditioning" },
  { id: 22, claim: "Among the young city's first industrial buildings" },
  { id: 23, claim: 'First home of the Israel Philharmonic' },
  { id: 29, claim: 'The city’s first art museum — and where the State was declared' },
  { id: 32, claim: "Tel Aviv's first City Hall" },
];

export const innovationFirsts = FIRSTS.map((f) => ({ ...f, building: buildings.find((b) => b.id === f.id)! }))
  .filter((f) => f.building)
  .sort((a, b) => (parseYear(a.building.year) || Infinity) - (parseYear(b.building.year) || Infinity));

export default function Innovations() {
  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Atlas</Text>
        <Text style={styles.name}>Innovations</Text>
        <Text style={styles.tagline}>
          The true firsts — where a building was genuinely the first, or the only, of its kind for the
          city, the country, or the world.
        </Text>

        {innovationFirsts.map(({ building: b, claim }) => (
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
              {b.year} · {b.style} · {b.architect}
            </Text>
            <Text style={styles.claim}>{claim}</Text>
            <Text style={styles.prose}>{b.whyItMatters}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 104,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  kicker: { ...ui.label, color: colors.terracotta },
  name: { ...editorial.architectName, color: colors.ink },
  tagline: { ...editorial.cardTitle, color: colors.inkSoft, marginTop: spacing.xs },
  item: { gap: 4, marginTop: spacing.xl },
  pressed: { opacity: 0.85 },
  bulletHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.terracotta },
  itemName: { ...editorial.cardTitle, fontSize: 16, color: colors.terracotta, flex: 1 },
  itemMeta: { ...ui.metadataSmall, color: colors.muted, marginLeft: 14 },
  claim: { ...ui.body, fontWeight: '700', color: colors.ink, marginTop: 4, marginLeft: 14 },
  prose: { ...ui.body, color: colors.body, marginTop: 2, marginLeft: 14 },
});
