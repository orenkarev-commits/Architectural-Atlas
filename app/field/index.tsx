import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, UIManager, View } from 'react-native';
import { router } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { innovationFirsts } from '../innovations';
import { MotionGradient } from '../../components/MotionGradient';
import { BackButton } from '../../components/BackButton';
import { GlassCard } from '../../components/GlassCard';
import { NolliBand } from '../../components/NolliBand';
import { tourCategories } from '../../data/mapTours';
import { buildings } from '../../data/buildings';
import { feed, activeCategories, type FeedStory } from '../../lib/feed';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

function openStory(s: FeedStory) {
  if (s.storyId) router.push({ pathname: '/story/[id]', params: { id: s.storyId } });
  else if (s.buildingId != null)
    router.push({ pathname: '/locating', params: { buildingId: String(s.buildingId) } });
  else if (s.architectName)
    router.push({ pathname: '/architects/[name]', params: { name: s.architectName } });
}

export default function FieldResearch() {
  const [cat, setCat] = useState<string | null>(null);
  const [catTouched, setCatTouched] = useState(false);
  const [openTourCat, setOpenTourCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Address (and name) lookup so stories can be searched by where they are.
  const addrById = useMemo(() => {
    const m: Record<number, string> = {};
    for (const b of buildings) m[b.id] = b.address;
    return m;
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feed.filter((f) => {
      if (cat && f.category !== cat) return false;
      if (!q) return true;
      const hay = [
        f.title,
        f.subtitle,
        f.buildingId != null ? addrById[f.buildingId] : '',
        f.architectName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [cat, query, addrById]);

  return (
    <MotionGradient variant="warm">
      <BackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Stories</Text>

        {/* The Nolli band opens the main map. */}
        <Pressable onPress={() => router.push('/map')}>
          <NolliBand />
        </Pressable>

        {/* Stories at the top — search + categories only; the list stays hidden until you search or pick a category. */}
        <View style={styles.section}>
          <Text style={styles.toursTitle}>Stories</Text>
          <Text style={styles.explainer}>
            Every building and every architect has one — search by address, or sift by category.
          </Text>

          <TextInput
            style={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by address or name…"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />

          <View style={styles.filters}>
            <Pressable onPress={() => { setCat(null); setCatTouched(true); }} style={[styles.filter, !cat && styles.filterOn]}>
              <Text style={[styles.filterText, !cat && styles.filterTextOn]}>All</Text>
            </Pressable>
            {activeCategories.map((c) => {
              const on = cat === c;
              return (
                <Pressable key={c} onPress={() => { setCat(c); setCatTouched(true); }} style={[styles.filter, on && styles.filterOn]}>
                  <Text style={[styles.filterText, on && styles.filterTextOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          {query.trim() || catTouched ? (
            <View style={styles.list}>
              {shown.map((s) => (
                <GlassCard key={s.key} style={styles.storyCard} onPress={() => openStory(s)}>
                  <View style={styles.storyTagRow}>
                    <Text style={styles.storyTag}>{s.category}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                  <Text style={styles.storyTitle}>{s.title}</Text>
                  <Text style={styles.storyPlace}>{s.subtitle}</Text>
                </GlassCard>
              ))}
              {shown.length === 0 ? <Text style={styles.explainer}>No stories match yet.</Text> : null}
            </View>
          ) : null}
        </View>

        {/* Innovations — the true firsts, every one shown as a single line. */}
        <View style={styles.section}>
          <Text style={styles.toursTitle}>Innovations</Text>
          <Text style={styles.explainer}>
            The genuine firsts in the collection — a building that did something before anyone else here.
          </Text>
          <View style={styles.innoList}>
            {innovationFirsts.map(({ building: b, claim }) => (
              <Pressable
                key={b.id}
                style={({ pressed }) => [styles.innoRow, pressed && styles.innoRowPressed]}
                onPress={() => router.push({ pathname: '/locating', params: { buildingId: String(b.id) } })}
              >
                <View style={styles.innoBullet} />
                <Text style={styles.innoText} numberOfLines={1}>
                  <Text style={styles.innoName}>{b.name}</Text> — {claim}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tours below. */}
        <View style={styles.section}>
          <Text style={styles.toursTitle}>Tours</Text>
          <Text style={styles.explainer}>
            Guided walks — by architect, by style, or through history. Tap to run one on the map.
          </Text>
          {tourCategories.map((c) => {
            const open = openTourCat === c.key;
            return (
              <View key={c.key} style={styles.tourCat}>
                <Pressable
                  style={styles.tourCatHead}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setOpenTourCat(open ? null : c.key);
                  }}
                >
                  <Text style={styles.tourCatName}>
                    {c.name} · <Text style={styles.tourCatBlurb}>{c.blurb}</Text>
                  </Text>
                  <Text style={[styles.tourChevron, open && styles.tourChevronOpen]}>⌄</Text>
                </Pressable>
                {open ? (
                  <View style={styles.tourList}>
                    {c.tours.map((t) => (
                      <Pressable
                        key={t.key}
                        style={styles.tourRow}
                        onPress={() => router.push({ pathname: '/map', params: { tour: t.key } })}
                      >
                        <View style={styles.tourRowText}>
                          <Text style={styles.tourRowName}>{t.name}</Text>
                          <Text style={styles.tourRowSub}>{t.subtitle}</Text>
                        </View>
                        <Text style={styles.tourRowMeta}>{t.stopIds.length} stops ›</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </MotionGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 52,
    paddingBottom: spacing.huge,
    gap: spacing.xxl,
  },
  header: {
    ...editorial.screenHeader,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
    textAlign: 'center',
    paddingTop: 8,
  },
  section: { gap: spacing.base },
  explainer: { ...ui.bodySmall, color: colors.body },
  search: {
    ...ui.body,
    color: colors.ink,
    backgroundColor: colors.glassFillStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  filter: {
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    borderRadius: radii.circle,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterOn: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  filterText: { ...ui.metadataSmall, color: colors.inkSoft },
  filterTextOn: { color: colors.white },
  list: { gap: spacing.base },
  innoList: { marginTop: spacing.xs },
  innoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  innoRowPressed: { opacity: 0.6 },
  innoBullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.terracotta, flexShrink: 0 },
  innoText: { ...ui.bodySmall, color: colors.body, flex: 1 },
  innoName: { color: colors.inkSoft, fontWeight: '700' },
  storyCard: { padding: 15 },
  storyTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTag: { ...ui.label, color: colors.terracottaTextOnTint },
  chevron: { color: colors.terracotta, fontSize: 16 },
  storyTitle: { ...editorial.cardTitleLg, color: colors.inkSoft, marginTop: spacing.xs },
  storyPlace: { ...ui.metadata, color: colors.muted, marginTop: 3 },
  toursTitle: { ...editorial.cardTitleLg, color: colors.ink, fontWeight: '700', fontSize: 21 },
  tourCat: { marginTop: spacing.sm },
  tourCatHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warmScrim,
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  tourChevron: { ...ui.body, fontSize: 18, lineHeight: 18, color: colors.terracotta },
  tourChevronOpen: { transform: [{ rotate: '180deg' }] },
  tourCatName: { ...ui.label, color: colors.terracotta },
  tourCatBlurb: { ...ui.metadataSmall, color: colors.muted, textTransform: 'none' },
  tourList: { gap: spacing.base, marginTop: spacing.sm },
  tourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassFillStrong,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tourRowText: { flex: 1 },
  tourRowName: { ...editorial.cardTitleLg, color: colors.inkSoft },
  tourRowSub: { ...ui.metadata, color: colors.muted, marginTop: 2 },
  tourRowMeta: { ...ui.metadataSmall, color: colors.terracotta },
});
