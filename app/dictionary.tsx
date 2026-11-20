import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { SectionLabel } from '../components/SectionLabel';
import { terms, termCategoryOrder, type TermCategory } from '../data/terms';
import { colors, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const CATEGORY_TITLE: Record<TermCategory, string> = {
  style: 'Styles & periods',
  construction: 'Construction & materials',
  element: 'Façade elements',
  history: 'History & use',
};

export default function Dictionary() {
  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Architectural Intelligence</Text>
        <Text style={styles.name}>Dictionary</Text>
        <Text style={styles.tagline}>
          The working vocabulary the Atlas reads buildings with — every term drawn from a building we hold,
          and sourced, never inferred from style.
        </Text>

        {termCategoryOrder.map((cat) => {
          const group = terms.filter((t) => t.category === cat);
          if (group.length === 0) return null;
          return (
            <View key={cat} style={styles.section}>
              <SectionLabel>{CATEGORY_TITLE[cat]}</SectionLabel>
              {group.map((t) => (
                <View key={t.term} style={styles.term}>
                  <View style={styles.bulletHead}>
                    <View style={styles.bullet} />
                    <Text style={styles.termName}>{t.term}</Text>
                  </View>
                  <Text style={styles.def}>{t.definition}</Text>
                  <Text style={styles.seen}>Seen at: {t.seenAt.join(' · ')}</Text>
                </View>
              ))}
            </View>
          );
        })}
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
  section: { gap: spacing.md, marginTop: spacing.xl },
  term: { gap: 4 },
  bulletHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.terracotta },
  termName: { ...editorial.cardTitle, fontSize: 16, color: colors.terracotta, flex: 1 },
  def: { ...ui.body, color: colors.body, marginLeft: 14 },
  seen: { ...ui.metadataSmall, color: colors.muted, marginLeft: 14 },
});
