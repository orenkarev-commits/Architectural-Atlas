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
import { quotesFor } from '../../data/architectQuotes';
import { toBullets } from '../../lib/bullets';
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

/** The style arc as a small left-to-right progression — only when there's more than one stage. */
function StyleStages({ arc }: { arc?: string }) {
  const stages = (arc ?? '')
    .split(/[→>]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (stages.length < 2) return null;
  return (
    <View style={styles.section}>
      <SectionLabel>Style, over time</SectionLabel>
      <View style={styles.stagesRow}>
        {stages.map((s, i) => (
          <React.Fragment key={`${s}-${i}`}>
            <View style={styles.stageChip}>
              <Text style={styles.stageText}>{s}</Text>
            </View>
            {i < stages.length - 1 ? <Text style={styles.stageArrow}>→</Text> : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function ArchitectProfile() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const architect = architects.find((a) => a.name === name);
  const architectBuildings = buildings.filter((b) => b.architect === name);
  const atlasNames = new Set(architectBuildings.map((b) => b.name));
  const notYet = (architect?.works ?? []).filter((w) => !atlasNames.has(w.name));
  const compassBuildings = architectBuildings.length > 0 ? architectBuildings : buildings;

  if (!architect) return null;

  const portrait = portraitFor(architect.name);
  const storyBullets = toBullets(architect.innovation);
  const quotes = quotesFor(architect.name);

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

        {/* 1 — the quote(s) lead, with context + date in small print */}
        {quotes.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>In their words</SectionLabel>
            <View style={styles.quoteList}>
              {quotes.map((q, i) => (
                <View key={i} style={styles.quoteBlock}>
                  <Text style={styles.quoteText}>“{q.text}”</Text>
                  {q.context || q.date ? (
                    <Text style={styles.quoteContext}>
                      {q.date ? q.date + ' — ' : ''}
                      {q.context}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 2 — major work */}
        {architect.signature ? (
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Major work</Text>
            <Text style={styles.signatureWork}>{architect.signature.work}</Text>
            <Text style={styles.signatureNote}>{architect.signature.note}</Text>
          </View>
        ) : null}

        {/* 3 — a timeline of stylistic change, if relevant */}
        <StyleStages arc={architect.styleArc ?? architect.school} />

        {/* 4 — the story, bulleted for legibility */}
        <View style={styles.section}>
          <SectionLabel>The story</SectionLabel>
          <View style={styles.bullets}>
            {storyBullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5 — active / education, near the end */}
        <View style={styles.factsCard}>
          <Fact label="Active" value={architect.active} />
          <Fact label="Education" value={architect.education} />
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
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.xxl,
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
    backgroundColor: colors.bubble,
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  quoteText: {
    ...editorial.cardTitleLg,
    fontSize: 17,
    lineHeight: 25,
    color: colors.inkSoft,
  },
  quoteList: {
    gap: spacing.md,
  },
  quoteContext: {
    ...ui.metadataSmall,
    color: colors.muted,
    marginTop: spacing.sm,
    lineHeight: 16,
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
  stagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stageChip: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.circle,
    paddingHorizontal: spacing.base,
    paddingVertical: 5,
  },
  stageText: { ...editorial.cardTitle, fontSize: 13, color: colors.ink },
  stageArrow: { ...ui.body, color: colors.terracotta, marginHorizontal: 2 },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletDot: {
    ...ui.body,
    color: colors.terracotta,
    lineHeight: 22,
  },
  bulletText: {
    ...ui.body,
    flex: 1,
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
