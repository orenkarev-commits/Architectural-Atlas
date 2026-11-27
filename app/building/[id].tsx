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
import { photoNotes } from '../../data/photos';
import { fieldGuideFor, type FieldGuide } from '../../data/fieldGuides';
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

/** The full text, kept whole: the first paragraph shows, the rest opens with "Read more". */
function ReadMore({ text, open, onToggle }: { text: string; open: boolean; onToggle: () => void }) {
  const paras = toParagraphs(text);
  const shown = open ? paras : paras.slice(0, 1);
  return (
    <View style={styles.paraWrap}>
      {shown.map((p, i) => (
        <Text key={i} style={[styles.storyText, i === 0 && styles.storyLead]}>
          {p}
        </Text>
      ))}
      {paras.length > 1 ? (
        <Pressable onPress={onToggle} hitSlop={8} accessibilityRole="button">
          <Text style={styles.readMore}>{open ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** "Reading the front": numbered pins on a photo, elevation or plan, with the terms listed below. */
function FieldGuideView({ guide, src }: { guide: FieldGuide; src: any }) {
  const ratio = guide.ratio;
  return (
    <View style={{ gap: spacing.md }}>
      <View>
        <View style={[styles.guideBox, { aspectRatio: ratio }]}>
          <Image source={src} style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]} resizeMode="contain" />
        </View>
        {guide.pins.map((p, i) => (
          <View key={i} style={[styles.pin, { left: `${p.x}%`, top: `${p.y}%` }]} pointerEvents="none">
            <Text style={styles.pinText}>{i + 1}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.planCaption}>{guide.caption}</Text>
      {guide.pins.map((p, i) => (
        <View key={i} style={styles.term}>
          <View style={styles.termNum}><Text style={styles.termNumText}>{i + 1}</Text></View>
          <Text style={styles.termText}><Text style={styles.termName}>{p.term}. </Text>{p.note}</Text>
        </View>
      ))}
    </View>
  );
}

/** A chapter: icon and title, a short preview; tapping the icon or title reveals the full text. */
function Chapter({ icon, title, children }: { icon: SectionIconName; title: string; children: (open: boolean, toggle: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);
  return (
    <View style={styles.section}>
      <Pressable onPress={toggle} style={styles.sectionHead} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={[styles.sectionHeadIcon, open && styles.sectionHeadIconOn]}>
          <SectionIcon name={icon} size={22} />
        </View>
        <Text style={styles.sectionHeadTitle}>{title}</Text>
      </Pressable>
      {children(open, toggle)}
    </View>
  );
}

/** A timeline that shows its first entries and opens the rest with "Read more". */
function Timeline({ rows, open, onToggle }: { rows: { year: string; note: string }[]; open: boolean; onToggle: () => void }) {
  const shown = open ? rows : rows.slice(0, 2);
  return (
    <View style={styles.timeline}>
      {shown.map((t, i) => (
        <View key={i} style={styles.timelineRow}>
          <Text style={styles.timelineYear}>{t.year}</Text>
          <Text style={styles.timelineNote}>{t.note}</Text>
        </View>
      ))}
      {rows.length > 2 ? (
        <Pressable onPress={onToggle} hitSlop={8} accessibilityRole="button">
          <Text style={styles.readMore}>{open ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}
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
  const planYears = plans.map((p) => p.year).filter((y) => y > 0);
  const firstPlan = planYears.length ? Math.min(...planYears) : null;
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
  const guides = fieldGuideFor(building.id)
    .map((g) => ({ g, src: g.on === 'photo' ? building.image : plans.find((p) => p.kind === g.on)?.src }))
    .filter((x) => x.src);
  const slides: { key: string; src: any; onPress: () => void }[] = [
    { key: 'photo', src: building.image, onPress: () => setPhotoBig(true) },
    ...plans.map((plan, i) => ({ key: `plan-${i}`, src: plan.src, onPress: () => setActivePlan(plan) })),
  ];
  const pressed = ({ pressed: p }: { pressed: boolean }) => (p ? styles.pressed : null);

  // The four content topics, shown as a 2×2 grid of glass cards; the selected one opens below.
  type SectionDef = { key: string; icon: SectionIconName; title: string; render: (open: boolean, toggle: () => void) => React.ReactNode };
  const sectionDefs: SectionDef[] = [
    ...(story
      ? [{
          key: 'story', icon: 'story' as const, title: 'The story',
          render: (open: boolean, toggle: () => void) => (
            <>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <ReadMore text={story.reveal} open={open} onToggle={toggle} />
            </>
          ),
        }]
      : []),
    {
      key: 'matters', icon: 'matters' as const, title: 'Why it matters',
      render: (open: boolean, toggle: () => void) => <ReadMore text={building.whyItMatters} open={open} onToggle={toggle} />,
    },
    ...(building.timeline && building.timeline.length > 0
      ? [{
          key: 'life', icon: 'life' as const, title: 'Life of the building',
          render: (open: boolean, toggle: () => void) => <Timeline rows={building.timeline!} open={open} onToggle={toggle} />,
        }]
      : []),
    ...(building.materials
      ? [{
          key: 'materials', icon: 'materials' as const, title: 'Materials and construction',
          render: (open: boolean, toggle: () => void) => <ReadMore text={building.materials!} open={open} onToggle={toggle} />,
        }]
      : []),
  ];
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
            {photoNotes[building.id] && slide === 0 ? (
              <View style={styles.photoNote} pointerEvents="none">
                <Text style={styles.photoNoteText}>{photoNotes[building.id]}</Text>
              </View>
            ) : null}
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
              <Text style={styles.factLabel}>Built</Text>
            </Pressable>
            <Pressable
              style={(st) => [styles.fact, styles.factDivider, pressed(st)]}
              onPress={() => openAtlas(building.style)}
            >
              <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {building.style.replace(/\s*style$/i, '')}
              </Text>
              <Text style={styles.factLabel}>Style</Text>
            </Pressable>
            {firstPlan ? (
              <View style={[styles.fact, styles.factDivider]}>
                <Text style={styles.factValue}>{firstPlan}</Text>
                <Text style={styles.factLabel}>Earliest drawing</Text>
              </View>
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
            <CollapsibleSection title="From the archive" defaultOpen>
              {plans.map((plan, i) => (
                <View key={i} style={styles.planBlock}>
                  <Pressable onPress={() => setActivePlan(plan)}>
                    <Image source={plan.src} style={styles.planImage} resizeMode="contain" />
                    <View style={styles.zoomHint}>
                      <Text style={styles.zoomHintText}>Tap to enlarge</Text>
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

          {guides.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeadTitle}>Reading the front</Text>
              {guides.map(({ g, src }, i) => <FieldGuideView key={i} guide={g} src={src} />)}
            </View>
          ) : null}

          {/* Every topic shown in full, each under its Bauhaus icon — rich and complete. */}
          {sectionDefs.map((s) => (
            <Chapter key={s.key} icon={s.icon} title={s.title}>
              {(open, toggle) => s.render(open, toggle)}
            </Chapter>
          ))}

          <PrimaryButton label="Open in field research" onPress={() => router.push('/field')} />
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
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  architectStripText: { flex: 1, minWidth: 0 },
  architectStripLabel: {
    ...ui.metadataSmall,
    color: colors.muted,
  },
  architectStripName: { ...editorial.cardTitle, color: colors.ink, marginTop: 1 },
  architectStripChevron: { ...ui.body, fontSize: 24, color: colors.muted },
  avatarStripEmpty: { backgroundColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  avatarStripText: { ...editorial.cardTitle, color: colors.ink },

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

  // Full, always-visible section with a Bauhaus icon header
  section: { gap: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionHeadIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sectionHeadTitle: { ...editorial.cardTitleLg, color: colors.ink },
  sectionHeadIconOn: { borderColor: colors.ink },

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
    color: colors.muted,
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
    ...ui.metadata,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
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
  guideBox: { width: '100%', borderRadius: radii.md, overflow: 'hidden', backgroundColor: colors.surfaceTint },
  pin: {
    position: 'absolute', width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.hairline,
  },
  pinText: { ...ui.metadataSmall, color: colors.ink },
  term: { flexDirection: 'row', gap: spacing.md },
  termNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  termNumText: { ...ui.metadataSmall, color: colors.surface },
  termText: { ...ui.body, flex: 1, color: colors.body },
  termName: { ...ui.body, color: colors.ink, fontWeight: '600' },
  readMore: { ...ui.metadata, color: colors.ink, textDecorationLine: 'underline' },
  photoNote: {
    position: 'absolute', left: 12, top: 12,
    backgroundColor: 'rgba(20,17,15,0.72)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  photoNoteText: { ...ui.metadataSmall, color: colors.white },
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
    ...ui.metadata,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  planCaption: {
    ...ui.body,
    fontSize: 13,
    color: colors.muted,
  },
});
