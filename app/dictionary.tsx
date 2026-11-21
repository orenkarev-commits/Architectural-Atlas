import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { SectionLabel } from '../components/SectionLabel';
import { terms, termCategoryOrder, type TermCategory } from '../data/terms';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const CATEGORY_TITLE: Record<TermCategory, string> = {
  style: 'Styles & periods',
  construction: 'Construction & materials',
  element: 'Façade elements',
  history: 'History & use',
};

export default function Dictionary() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.seenAt.some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.kicker}>Architectural Intelligence</Text>
        <Text style={styles.name}>Dictionary</Text>
        <Text style={styles.tagline}>
          The working vocabulary the Atlas reads buildings with — {terms.length} terms, sourced, never inferred
          from style. Those tied to a building we hold say where to see them.
        </Text>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${terms.length} terms…`}
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {query.trim() ? (
          <Text style={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'match' : 'matches'}
          </Text>
        ) : null}

        {termCategoryOrder.map((cat) => {
          const group = filtered.filter((t) => t.category === cat);
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
                  {t.seenAt.length > 0 ? (
                    <Text style={styles.seen}>Seen at: {t.seenAt.join(' · ')}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}

        {filtered.length === 0 ? <Text style={styles.empty}>No term matches “{query.trim()}”.</Text> : null}
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
  search: {
    ...ui.body,
    color: colors.ink,
    backgroundColor: colors.glassFillStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    marginTop: spacing.base,
  },
  count: { ...ui.metadataSmall, color: colors.muted, marginTop: spacing.xs },
  section: { gap: spacing.md, marginTop: spacing.xl },
  term: { gap: 4 },
  bulletHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.terracotta },
  termName: { ...editorial.cardTitle, fontSize: 16, color: colors.terracotta, flex: 1 },
  def: { ...ui.body, color: colors.body, marginLeft: 14 },
  seen: { ...ui.metadataSmall, color: colors.muted, marginLeft: 14 },
  empty: { ...ui.body, color: colors.muted, marginTop: spacing.xl, textAlign: 'center' },
});
