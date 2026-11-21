import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Marker } from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MapStyled } from '../../components/MapStyled';
import { BackButton } from '../../components/BackButton';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { SectionIcon, type SectionIconName } from '../../components/SectionIcon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { buildings } from '../../data/buildings';
import { architects } from '../../data/architects';
import { stories } from '../../data/stories';
import { plansForBuilding, type Plan } from '../../data/plans';
import { PlanViewer } from '../../components/PlanViewer';
import { toBullets } from '../../lib/bullets';
import { parseYear } from '../../lib/year';
import { portraitFor } from '../../data/portraits';
import { toLatLng, toRegion } from '../../lib/coords';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

const MAP_HEIGHT = 300;
const SHEET_OVERLAP = 28;
const HERO_HEIGHT = 250;
const BAR_SPACE = 90;

const PLAN_KIND_LABEL: Record<string, string> = {
  plan: 'Floor plan',
  elevation: 'Elevation',
  section: 'Section',
  site: 'Survey sheet',
};

function Bullets({ text }: { text: string }) {
  const items = toBullets(text);
  return (
    <View style={styles.bullets}>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

/** Split long prose into readable paragraphs (on blank lines, else ~2 sentences each). */
function toParagraphs(text: string): string[] {
  if (!text) return [];
  const byBlank = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (byBlank.length > 1) return byBlank;
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(' ').trim());
  return out.filter(Boolean);
}

function Paragraphs({ text }: { text: string }) {
  const paras = toParagraphs(text);
  return (
    <View style={styles.paraWrap}>
      {paras.map((p, i) => (
        <Text key={i} style={[styles.storyText, i === 0 && styles.storyLead]}>
          {p}
        </Text>
      ))}
    </View>
  );
}

export default function BuildingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const building = buildings.find((b) => String(b.id) === id);
  const architect = building ? architects.find((a) => a.name === building.architect.replace(/ \(attributed\)$/, '')) : undefined;
  const plans = building ? plansForBuilding(building.id) : [];
  const story = building ? stories.find((s) => s.buildingId === building.id) : undefined;
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [photoBig, setPhotoBig] = useState(false);
  const [slide, setSlide] = useState(0);
  const [activeKey, setActiveKey] = useState<string>('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    translateY.value = withTiming(0, { duration: 350 });
  }, [opacity, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!building) return null;

  const builtYear = parseYear(building.year);
  // Only state an age when the year itself is a firm date (e.g. 1932, 1922–27), never for 'Early 1920s' / 'c. 1932'.
  const firmYear = typeof building.year === 'number' || /^\d{4}/.test(String(building.year));
  const age = builtYear && firmYear ? new Date().getFullYear() - builtYear : null;
  const unattributed = /^(unverified|unknown|unattributed)/i.test(building.architect);
  const portrait = portraitFor(building.architect);
  const initials =
    building.architect
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .slice(0, 2)
      .join('') || '?';
  const avatarLabel = unattributed ? '?' : initials;
  const openMap = () => router.push({ pathname: '/map', params: { focus: String(building.id) } });
  const openAtlas = (style?: string) =>
    router.push(style ? { pathname: '/atlas', params: { style } } : '/atlas');
  const slides: { key: string; src: any; onPress: () => void }[] = [
    { key: 'photo', src: building.image, onPress: () => setPhotoBig(true) },
    ...plans.map((plan, i) => ({ key: `plan-${i}`, src: plan.src, onPress: () => setActivePlan(plan) })),
  ];
  const pressed = ({ pressed: p }: { pressed: boolean }) => (p ? styles.pressed : null);

  // The four content topics, shown as a 2×2 grid of glass cards; the selected one opens below.
  type SectionDef = { key: string; icon: SectionIconName; title: string; render: () => React.ReactNode };
  const sectionDefs: SectionDef[] = [
    ...(story
      ? [{
          key: 'story', icon: 'story' as const, title: 'The Story',
          render: () => (
            <>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Paragraphs text={story.reveal} />
            </>
          ),
        }]
      : []),
    {
      key: 'matters', icon: 'matters' as const, title: 'Why it Matters',
      render: () => <Bullets text={building.whyItMatters} />,
    },
    ...(building.timeline && building.timeline.length > 0
      ? [{
          key: 'life', icon: 'life' as const, title: 'Life of the Building',
          render: () => (
            <View style={styles.timeline}>
              {building.timeline!.map((t, i) => (
                <View key={i} style={styles.timelineRow}>
                  <Text style={styles.timelineYear}>{t.year}</Text>
                  <Text style={styles.timelineNote}>{t.note}</Text>
                </View>
              ))}
            </View>
          ),
        }]
      : []),
    ...(building.materials
      ? [{
          key: 'materials', icon: 'materials' as const, title: 'Materials & Construction',
          render: () => <Bullets text={building.materials!} />,
        }]
      : []),
  ];
  const currentKey = activeKey && sectionDefs.some((s) => s.key === activeKey) ? activeKey : sectionDefs[0]?.key ?? '';
  const current = sectionDefs.find((s) => s.key === currentKey);

  return (
    <View style={styles.container}>
      <MapStyled
        style={styles.map}
        initialRegion={toRegion(building.resolved, 17)}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker coordinate={toLatLng(building.resolved)} />
      </MapStyled>
      <BackButton />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Listing layout: swipeable hero (photo, then archive sheets) */}
          <View style={[styles.hero, { width }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={32}
              onScroll={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {slides.map((sl) => (
                <Pressable key={sl.key} onPress={sl.onPress} accessibilityRole="imagebutton">
                  <Image
                    source={sl.src}
                    style={{ width, height: HERO_HEIGHT }}
                    resizeMode={sl.key === 'photo' ? 'cover' : 'contain'}
                  />
                </Pressable>
              ))}
            </ScrollView>
            {slides.length > 1 ? (
              <>
                <View style={styles.dots} pointerEvents="none">
                  {slides.map((sl, i) => (
                    <View key={sl.key} style={[styles.dot, i === slide && styles.dotOn]} />
                  ))}
                </View>
                <View style={styles.count} pointerEvents="none">
                  <Text style={styles.countText}>{`${slide + 1} / ${slides.length}`}</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.name}>{building.name}</Text>
            <Pressable onPress={openMap} hitSlop={6} style={pressed}>
              <Text style={styles.address}>{building.address}</Text>
            </Pressable>
            {building.styleNote ? <Text style={styles.note}>{building.styleNote}</Text> : null}
          </View>

          <View style={styles.facts}>
            <Pressable style={(st) => [styles.fact, pressed(st)]} onPress={() => openAtlas()}>
              <Text style={styles.factValue}>{String(building.year)}</Text>
              <Text style={styles.factLabel}>built</Text>
            </Pressable>
            <Pressable
              style={(st) => [styles.fact, styles.factDivider, pressed(st)]}
              onPress={() => openAtlas(building.style)}
            >
              <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {building.style.replace(/\s*style$/i, '')}
              </Text>
              <Text style={styles.factLabel}>style</Text>
            </Pressable>
            {age ? (
              <Pressable style={(st) => [styles.fact, styles.factDivider, pressed(st)]} onPress={() => openAtlas()}>
                <Text style={styles.factValue}>{age}</Text>
                <Text style={styles.factLabel}>years</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Architect — a terracotta strip that opens the architect's page. */}
          <Pressable
            style={(st) => [styles.architectStrip, pressed(st)]}
            disabled={!architect}
            onPress={() => {
              if (architect) {
                router.push({ pathname: '/architects/[name]', params: { name: architect.name } });
              }
            }}
          >
            {portrait ? (
              <Image source={portrait} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarStripEmpty]}>
                <Text style={styles.avatarStripText}>{avatarLabel}</Text>
              </View>
            )}
            <View style={styles.architectStripText}>
              <Text style={styles.architectStripLabel}>Architect</Text>
              <Text style={styles.architectStripName} numberOfLines={2}>{building.architect}</Text>
            </View>
            {architect ? <Text style={styles.architectStripChevron}>›</Text> : null}
          </Pressable>

          {/* The Archive opens first, directly under the architect; then the Story, then
              Why it Matters, Life, Materials. */}
          {plans.length > 0 ? (
            <CollapsibleSection title="From the Archive" icon={<SectionIcon name="archive" />} defaultOpen>
              {plans.map((plan, i) => (
                <View key={i} style={styles.planBlock}>
                  <Pressable onPress={() => setActivePlan(plan)}>
                    <Image source={plan.src} style={styles.planImage} resizeMode="contain" />
                    <View style={styles.zoomHint}>
                      <Text style={styles.zoomHintText}>Tap to study ⤢</Text>
                    </View>
                  </Pressable>
                  <Text style={styles.planKind}>
                    {PLAN_KIND_LABEL[plan.kind]}
                    {plan.year ? ` · ${plan.year}` : ''}
                  </Text>
                  <Text style={styles.planCaption}>{plan.caption}</Text>
                </View>
              ))}
            </CollapsibleSection>
          ) : null}

          {/* The four topics as a 2×2 grid of glass cards; the chosen one opens below. */}
          <View style={styles.sectionGrid}>
            {sectionDefs.map((s) => {
              const on = s.key === currentKey;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setActiveKey(s.key)}
                  style={({ pressed: p }) => [styles.sectionCard, on && styles.sectionCardOn, p && styles.pressed]}
                >
                  <View style={styles.sectionIconWrap}>
                    <SectionIcon name={s.icon} size={46} color={on ? colors.white : colors.terracotta} />
                  </View>
                  <Text style={[styles.sectionCardTitle, on && styles.sectionCardTitleOn]} numberOfLines={2}>
                    {s.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {current ? (
            <View style={styles.sectionPanel}>
              <Text style={styles.sectionPanelTitle}>{current.title}</Text>
              {current.render()}
            </View>
          ) : null}

          <PrimaryButton label="Open in Field research" onPress={() => router.push('/field')} />
        </Animated.View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Pressable onPress={openMap} style={(st) => [styles.barAddress, pressed(st)]}>
          <Text style={styles.barAddressText} numberOfLines={1}>{building.address}</Text>
        </Pressable>
        <Pressable onPress={openMap} style={(st) => [styles.barButton, pressed(st)]}>
          <Text style={styles.barButtonText}>Walk there</Text>
        </Pressable>
      </View>

      <PlanViewer
        visible={activePlan !== null}
        source={activePlan?.src ?? null}
        caption={
          activePlan
            ? `${PLAN_KIND_LABEL[activePlan.kind]} · ${activePlan.year} — ${activePlan.caption}`
            : undefined
        }
        onClose={() => setActivePlan(null)}
      />

      <PlanViewer
        visible={photoBig}
        source={photoBig ? building.image : null}
        caption={`${building.name} · ${building.address}`}
        onClose={() => setPhotoBig(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapTile,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MAP_HEIGHT,
  },
  scrollContent: {
    paddingTop: MAP_HEIGHT - SHEET_OVERLAP,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.xxl,
    paddingTop: 0,
    paddingBottom: spacing.huge + BAR_SPACE,
    overflow: 'hidden',
    gap: spacing.lg,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.85 },
  hero: {
    marginHorizontal: -spacing.xxl,
    height: HERO_HEIGHT,
    backgroundColor: colors.surfaceTint,
  },
  dots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { backgroundColor: colors.surface },
  count: {
    position: 'absolute', right: 12, bottom: 8,
    backgroundColor: 'rgba(20,17,15,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  countText: { ...ui.metadataSmall, color: colors.white },
  titleBlock: { gap: spacing.xs, marginTop: spacing.sm },
  note: { ...ui.metadata, color: colors.muted },
  facts: {
    flexDirection: 'row',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.hairline,
    paddingVertical: spacing.lg,
  },
  fact: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm, minWidth: 0 },
  factDivider: { borderLeftWidth: 1, borderLeftColor: colors.hairline },
  factValue: { ...editorial.cardTitle, color: colors.ink, textAlign: 'center' },
  factLabel: { ...ui.metadata, color: colors.muted, marginTop: 2 },
  sectionHeading: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.base },
  architectStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.terracotta,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    shadowColor: '#3A0A00',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  architectStripText: { flex: 1, minWidth: 0 },
  architectStripLabel: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  architectStripName: { ...editorial.cardTitle, color: colors.white, marginTop: 1 },
  architectStripChevron: { ...ui.body, fontSize: 24, color: 'rgba(255,255,255,0.85)' },
  avatarStripEmpty: { backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  avatarStripText: { ...editorial.cardTitle, color: colors.white },

  // 2×2 glass section grid
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionCard: {
    width: '48%',
    aspectRatio: 1.12,
    borderRadius: radii.lg,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    shadowColor: '#2A1008',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionIconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionCardOn: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  sectionCardTitle: { ...ui.buttonLabel, fontSize: 11.5, color: colors.ink, textAlign: 'center' },
  sectionCardTitleOn: { color: colors.white },
  sectionPanel: { marginTop: spacing.xs },
  sectionPanelTitle: { ...editorial.cardTitleLg, color: colors.ink, marginBottom: spacing.base },

  architectRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, flexShrink: 0 },
  avatarEmpty: { backgroundColor: colors.terracottaTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...editorial.cardTitle, color: colors.terracottaTextOnTint },
  chevron: { ...ui.body, fontSize: 22, color: colors.muted },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    paddingHorizontal: spacing.xxl, paddingTop: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
  barAddress: { flex: 1, minWidth: 0 },
  barAddressText: { ...ui.metadata, color: colors.muted },
  barButton: {
    backgroundColor: colors.terracotta, borderRadius: radii.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.base,
  },
  barButtonText: { ...ui.body, color: colors.white },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.hairline,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  name: {
    ...editorial.buildingName,
    color: colors.ink,
  },
  address: {
    ...ui.metadata,
    color: colors.terracottaTextOnTint,
  },
  architectName: {
    ...ui.body,
    fontSize: 16,
    flex: 1,
    color: colors.ink,
  },
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
  timeline: {
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineYear: {
    ...ui.label,
    color: colors.terracotta,
    width: 76,
    paddingTop: 1,
  },
  timelineNote: {
    ...ui.body,
    flex: 1,
    color: colors.body,
  },
  storyTitle: {
    ...editorial.cardTitleLg,
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  paraWrap: { gap: spacing.base },
  storyText: {
    ...ui.body,
    fontSize: 15.5,
    lineHeight: 24,
    color: colors.body,
  },
  // The opening paragraph, a touch larger and darker to pull the eye in.
  storyLead: {
    fontSize: 16.5,
    lineHeight: 26,
    color: colors.inkSoft,
  },
  planBlock: {
    gap: spacing.xs,
  },
  planImage: {
    width: '100%',
    height: 300,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceTint,
  },
  zoomHint: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(20,17,15,0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoomHintText: {
    ...ui.metadataSmall,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
  },
  planKind: {
    ...ui.label,
    color: colors.label,
    marginTop: spacing.xs,
  },
  planCaption: {
    ...ui.body,
    fontSize: 13,
    color: colors.muted,
  },
});
