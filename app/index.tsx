import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { GradientBackground } from '../components/GradientBackground';
import { ExpandingSearchInput } from '../components/ExpandingSearchInput';
import { StoryCard } from '../components/StoryCard';
import { useAtlas } from '../context/AtlasContext';
import { buildings } from '../data/buildings';
import { architects } from '../data/architects';
import { feed, type FeedStory } from '../lib/feed';
import { rotatedSlice } from '../lib/rotate';
import { matchBuilding, suggest, type Suggestion } from '../lib/search';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

// Terracotta-recoloured contour texture (from the old Field-research tile).
const fieldTexture = require('../assets/images/field-texture-terracotta.jpeg');

const STORY_CARD_W = 220;
const STORY_GAP = 14;

/** A rotating slice of the story feed, streaming slowly along the bottom (seamless marquee). */
function StoriesMarquee({ items, onOpen }: { items: FeedStory[]; onOpen: (s: FeedStory) => void }) {
  const setWidth = items.length * (STORY_CARD_W + STORY_GAP);
  const x = useSharedValue(0);
  useEffect(() => {
    // ~22 px/sec — slow, constant, seamless (translate one full set, then repeat).
    x.value = 0;
    x.value = withRepeat(withTiming(-setWidth, { duration: setWidth * 45, easing: Easing.linear }), -1, false);
  }, [x, setWidth]);
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={styles.marqueeClip} pointerEvents="box-none">
      <Animated.View style={[styles.marqueeRow, rowStyle]}>
        {[...items, ...items].map((s, i) => (
          <View key={`${s.key}-${i}`} style={styles.storyCardWrap}>
            <StoryCard tag={s.category} title={s.title} onPress={() => onOpen(s)} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/** A large map button — a plus in a circle with a slow pulsing ring behind it. */
function PulsingMapButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);
  useEffect(() => {
    scale.value = withRepeat(withTiming(2.3, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
  }, [scale, opacity]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mapBtnWrap, pressed && styles.pressedScale]}>
      <Animated.View style={[styles.mapPulseRing, ring]} pointerEvents="none" />
      <View style={styles.mapBtnCircle}>
        <View style={styles.plusIcon}>
          <View style={styles.plusBarH} />
          <View style={styles.plusBarV} />
        </View>
      </View>
    </Pressable>
  );
}

export default function Welcome() {
  const [query, setQuery] = useState('');
  const { pickStart, advanceStories, findNearMe, nearError } = useAtlas();
  const insets = useSafeAreaInsets();

  // The bottom marquee draws a rotating slice of the whole story feed; `pickStart`
  // advances on every return to the welcome screen, so it refreshes each visit.
  const feedSlice = rotatedSlice(feed, pickStart, 16);
  const openFeed = (s: FeedStory) => {
    if (s.storyId) router.push({ pathname: '/story/[id]', params: { id: s.storyId } });
    else if (s.buildingId != null)
      router.push({ pathname: '/locating', params: { buildingId: String(s.buildingId) } });
    else if (s.architectName)
      router.push({ pathname: '/architects/[name]', params: { name: s.architectName } });
  };
  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (hasFocusedOnce.current) advanceStories();
      hasFocusedOnce.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const suggestions = query.trim() ? suggest(query, buildings, architects) : [];

  const goToSuggestion = (s: Suggestion) => {
    setQuery('');
    if (s.kind === 'building' && s.buildingId != null) {
      router.push({ pathname: '/locating', params: { buildingId: String(s.buildingId) } });
    } else if (s.architectName) {
      router.push({ pathname: '/architects/[name]', params: { name: s.architectName } });
    }
  };

  const submitSearch = () => {
    const first = suggest(query, buildings, architects)[0];
    if (first) return goToSuggestion(first);
    const building = matchBuilding(query, buildings, architects);
    if (building) {
      setQuery('');
      router.push({ pathname: '/locating', params: { buildingId: String(building.id) } });
    }
  };

  const onOpenMap = () => {
    void findNearMe();
    router.push('/map');
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rule} />
        <Text style={styles.title}>The Architectural Atlas</Text>
        <Text style={styles.standfirst}>
          Tel Aviv, building by building — who made it, why it matters, and what it hides.
        </Text>

        {/* Centred search, in line with its dot */}
        <View style={styles.searchWrap}>
          <ExpandingSearchInput value={query} onChangeText={setQuery} onSubmit={submitSearch} />
          {suggestions.length > 0 ? (
            <View style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <Pressable
                  key={`${s.kind}-${s.buildingId ?? s.architectName ?? i}`}
                  onPress={() => goToSuggestion(s)}
                  style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionPressed]}
                >
                  <Text style={styles.suggestionTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>{s.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {/* Enlarged, pulsing map button */}
        <View style={styles.nearMeWrap}>
          <PulsingMapButton onPress={onOpenMap} />
          <Text style={styles.mapHint}>Open the map</Text>
          {nearError ? <Text style={styles.nearError}>{nearError}</Text> : null}
        </View>

        <View style={styles.circleRow}>
          <Pressable
            onPress={() => router.push('/atlas')}
            style={({ pressed }) => [styles.circle, pressed && styles.liftLarge]}
          >
            <View style={styles.atlasClip}>
              <Image source={fieldTexture} style={styles.atlasTexture} />
              <View style={styles.atlasTextureWrap}>
                <Text style={styles.atlasLabel}>Atlas</Text>
              </View>
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/architects')}
            style={({ pressed }) => [styles.circle, styles.glassCircle, pressed && styles.liftLarge]}
          >
            <Text style={styles.inkLabel}>Architects</Text>
          </Pressable>
        </View>

        {/* Stories — a slow, constant stream along the bottom; the centred title opens Field research */}
        <View style={styles.storiesWrap}>
          <Pressable
            onPress={() => router.push('/field')}
            style={({ pressed }) => [styles.storiesBand, pressed && styles.storiesBandPressed]}
          >
            <Text style={styles.storiesTitle}>Stories ›</Text>
          </Pressable>
          <StoriesMarquee items={feedSlice} onOpen={openFeed} />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const CIRCLE = 96;

const styles = StyleSheet.create({
  content: {
    paddingTop: 76,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  rule: {
    width: 32,
    height: 2,
    backgroundColor: colors.terracotta,
    marginBottom: 20,
  },
  title: {
    ...editorial.welcomeTitle,
    color: colors.ink,
    textAlign: 'center',
  },
  standfirst: {
    ...ui.bodyLarge,
    color: colors.muted,
    maxWidth: 300,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  searchWrap: {
    marginTop: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  suggestions: {
    marginTop: spacing.base,
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  suggestionPressed: { backgroundColor: colors.surfaceTint },
  suggestionTitle: { ...editorial.cardTitle, fontSize: 15, color: colors.ink },
  suggestionSub: { ...ui.metadataSmall, color: colors.muted, marginTop: 2 },

  nearMeWrap: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  mapBtnWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPulseRing: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.terracotta,
  },
  mapBtnCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  plusIcon: { width: 36, height: 36 },
  plusBarH: {
    position: 'absolute',
    top: 16,
    left: 0,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  plusBarV: {
    position: 'absolute',
    left: 16,
    top: 0,
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  pressedScale: { transform: [{ scale: 1.05 }] },
  mapHint: { ...ui.buttonLabel, color: colors.white },
  nearError: { ...ui.metadata, color: colors.body, textAlign: 'center', maxWidth: 260 },

  circleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liftLarge: { transform: [{ translateY: -3 }] },
  atlasClip: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    backgroundColor: colors.terracottaDark,
  },
  atlasTexture: {
    ...StyleSheet.absoluteFillObject,
    width: CIRCLE,
    height: CIRCLE,
    transform: [{ scale: 3 }],
  },
  atlasTextureWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atlasLabel: {
    ...ui.buttonLabel,
    color: colors.white,
    fontWeight: '700',
    textShadowColor: 'rgba(70,26,10,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  glassCircle: { backgroundColor: colors.glassFill, borderWidth: 1, borderColor: colors.glassBorder },
  inkLabel: { ...ui.buttonLabel, color: colors.ink },

  storiesWrap: {
    marginTop: spacing.xxxl,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  storiesBand: {
    alignSelf: 'stretch',
    backgroundColor: colors.terracotta,
    borderRadius: radii.md,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  storiesBandPressed: {
    opacity: 0.88,
  },
  storiesTitle: {
    ...ui.label,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  marqueeClip: {
    width: '100%',
    overflow: 'hidden',
  },
  marqueeRow: {
    flexDirection: 'row',
  },
  storyCardWrap: {
    width: STORY_CARD_W,
    marginRight: STORY_GAP,
  },
});
