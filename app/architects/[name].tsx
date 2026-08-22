import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { Badge } from '../../components/Badge';
import { CompassDial } from '../../components/CompassDial';
import { SectionLabel } from '../../components/SectionLabel';
import { architects } from '../../data/architects';
import { buildings } from '../../data/buildings';
import { portraitFor } from '../../data/portraits';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

function Fact({ label, value }: { label: string; value?: string }) {
  const v = value && value.trim() ? value : 'Not yet documented';
  const muted = v === 'Not yet documented';
  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, muted && styles.factValueMuted]}>{v}</Text>
    </View>
  );
}

export default function ArchitectProfile() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const architect = architects.find((a) => a.name === name);
  const architectBuildings = buildings.filter((b) => b.architect === name);
  const atlasNames = new Set(architectBuildings.map((b) => b.name));
  const notYet = (architect?.works ?? []).filter((w) => !atlasNames.has(w.name));
  // The compass aims at this architect's own nearest building; if none are in the
  // Atlas yet, it falls back to the nearest building overall.
  const compassBuildings = architectBuildings.length > 0 ? architectBuildings : buildings;

  if (!architect) return null;

  const portrait = portraitFor(architect.name);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CompassDial buildings={compassBuildings} />

        <View style={styles.headerRow}>
          {portrait ? <Image source={portrait} style={styles.portrait} resizeMode="cover" /> : null}
          <View style={styles.headerText}>
            <Text style={styles.name}>{architect.name}</Text>
            <Text style={styles.years}>{architect.years}</Text>
            <View style={styles.schoolWrap}>
              <Badge label={architect.school} variant="school" />
            </View>
          </View>
        </View>

        <View style={styles.factsCard}>
          <Fact label="Active" value={architect.active} />
          <Fact label="Education" value={architect.education} />
          <Fact label="Style arc" value={architect.styleArc ?? architect.school} />
        </View>

        {architect.signature ? (
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Major work</Text>
            <Text style={styles.signatureWork}>{architect.signature.work}</Text>
            <Text style={styles.signatureNote}>{architect.signature.note}</Text>
          </View>
        ) : null}

        {architect.quote ? (
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteText}>“{architect.quote}”</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionLabel>The story</SectionLabel>
          <Text style={styles.prose}>{architect.innovation}</Text>
        </View>

        {architectBuildings.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>{`In the atlas (${architectBuildings.length})`}</SectionLabel>
            <View style={styles.atlasList}>
              {architectBuildings.map((building) => (
                <Pressable
                  key={building.id}
                  style={({ pressed }) => [styles.atlasRow, pressed && styles.pressed]}
                  onPress={() =>
                    router.push({ pathname: '/locating', params: { buildingId: String(building.id) } })
                  }
                >
                  <Image source={building.image} style={styles.atlasThumb} />
                  <View>
                    <Text style={styles.atlasName}>{building.name}</Text>
                    <Text style={styles.atlasMeta}>
                      {building.year} · {building.style}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {notYet.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>More works — not in the Atlas</SectionLabel>
            <View style={styles.worksList}>
              {notYet.map((work) => (
                <View key={work.name} style={styles.workRow}>
                  <View style={styles.workDot} />
                  <Text style={styles.workName} numberOfLines={1}>{work.name}</Text>
                  <Text style={styles.workYear}>{work.year}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    // Clears the floating back button (top 52 + 38 high) so the 30px
    // architect name is never printed underneath it.
    paddingTop: 104,
    paddingBottom: spacing.huge,
    gap: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  portrait: {
    width: 92,
    height: 116,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceTint,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  schoolWrap: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  name: {
    ...editorial.architectName,
    color: colors.ink,
  },
  years: {
    ...ui.metadata,
    color: colors.muted,
  },
  factsCard: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  factRow: {
    gap: 2,
  },
  factLabel: {
    ...ui.label,
    color: colors.label,
  },
  factValue: {
    ...ui.body,
    color: colors.body,
  },
  factValueMuted: {
    color: colors.muted,
    fontStyle: 'italic',
  },
  quoteBlock: {
    backgroundColor: '#F5EFE7',
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  quoteText: {
    ...editorial.cardTitle,
    color: colors.inkSoft,
  },
  signatureBlock: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  signatureLabel: {
    ...ui.label,
    color: 'rgba(255,255,255,0.75)',
  },
  signatureWork: {
    ...editorial.cardTitle,
    fontSize: 18,
    color: colors.white,
    marginTop: 4,
  },
  signatureNote: {
    ...ui.body,
    color: 'rgba(255,255,255,0.94)',
    marginTop: 6,
  },
  section: {
    gap: spacing.sm,
  },
  prose: {
    ...ui.body,
    color: colors.body,
  },
  worksList: {
    gap: 7,
  },
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.terracotta,
  },
  workName: {
    ...ui.bodySmall,
    color: colors.body,
    flex: 1,
  },
  workYear: {
    ...ui.metadata,
    color: colors.muted,
  },
  atlasList: {
    gap: spacing.base,
  },
  atlasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  atlasThumb: {
    width: 52,
    height: 64,
    borderRadius: radii.xs,
  },
  atlasName: {
    ...editorial.cardTitle,
    fontSize: 15,
    color: colors.inkSoft,
  },
  atlasMeta: {
    ...ui.metadataSmall,
    color: colors.muted,
    marginTop: 2,
  },
});
