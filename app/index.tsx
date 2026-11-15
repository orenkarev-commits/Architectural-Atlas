import React, { useEffect, useRef, useState } from 'react';
import { Image, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { suggest, type Suggestion } from '../lib/search';
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

/** A pulsing ring behind a circle button. */
function PulseRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    scale.value = withRepeat(withTiming(2.2, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
  }, [scale, opacity]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return <Animated.View style={[styles.mapPulseRing, ring]} pointerEvents="none" />;
}

const CIRCLE = 72; // 25% smaller than the previous 96

export default function Welcome() {
  const [query, setQuery] = useState('');
  const { pickStart, advanceStories, findNearMe, nearError } = useAtlas();
  const insets = useSafeAreaInsets();

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

  // On submit (return key or the send arrow) just dismiss the keyboard and leave the
  // suggestion list up, so the user can pick a result themselves rather than being
  // jumped straight to the first match.
  const submitSearch = () => {
    Keyboard.dismiss();
  };

  const onOpenMap = () => {
    void findNearMe();
    router.push('/map');
  };

  return (
    <GradientBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 6 }]}>
        {/* Top: identity + search */}
        <View style={styles.top}>
          <View style={styles.rule} />
          <Text style={styles.title}>
            <Text style={styles.titleThe}>The </Text>Architectural Atlas
          </Text>
          <Text style={styles.standfirst}>
            Tel Aviv, building by building — who made it, why it matters, and what it hides.
          </Text>

          <View style={styles.searchWrap}>
            <ExpandingSearchInput
              value={query}
              onChangeText={setQuery}
              onSubmit={submitSearch}
              placeholder="What is that building?"
            />
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
        </View>

        {/* Middle: the map button, then the three destination circles */}
        <View style={styles.middle}>
          <Pressable onPress={onOpenMap} style={({ pressed }) => [styles.mapBtnWrap, pressed && styles.pressedScale]}>
            <PulseRing />
            <View style={styles.mapBtnCircle}>
              <View style={styles.plusIcon}>
                <View style={styles.plusBarH} />
                <View style={styles.plusBarV} />
              </View>
            </View>
          </Pressable>
          <Text style={styles.mapHint}>Open the map</Text>
          {nearError ? <Text style={styles.nearError}>{nearError}</Text> : null}

          <View style={styles.circleRow}>
            <Pressable
              onPress={() => router.push('/field')}
              style={({ pressed }) => [styles.circleItem, pressed && styles.lift]}
            >
              <View style={[styles.circle, styles.storiesCircle]}>
                <Text style={styles.storiesLabel} numberOfLines={1} adjustsFontSizeToFit>Stories</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/atlas')}
              style={({ pressed }) => [styles.circleItem, pressed && styles.lift]}
            >
              <View style={styles.atlasClip}>
                <Image source={fieldTexture} style={styles.atlasTexture} />
                <View style={styles.atlasTextureWrap}>
                  <Text style={styles.atlasLabel} numberOfLines={1} adjustsFontSizeToFit>Atlas</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/architects')}
              style={({ pressed }) => [styles.circleItem, pressed && styles.lift]}
            >
              <View style={[styles.circle, styles.glassCircle]}>
                <Text style={styles.inkLabel} numberOfLines={1} adjustsFontSizeToFit>Architects</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Bottom: the always-visible scrolling stories */}
        <View style={styles.bottom}>
          <StoriesMarquee items={feedSlice} onOpen={openFeed} />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 28,
  },
  top: {
    alignItems: 'center',
  },
  rule: {
    width: 32,
    height: 2,
    backgroundColor: colors.terracotta,
    marginBottom: 14,
  },
  title: {
    ...editorial.welcomeTitle,
    color: colors.ink,
    textAlign: 'center',
  },
  titleThe: {
    fontSize: 20,
    color: colors.muted,
  },
  standfirst: {
    ...ui.bodyLarge,
    fontSize: 9,
    lineHeight: 13,
    color: colors.muted,
    maxWidth: 230,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  searchWrap: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  suggestions: {
    marginTop: spacing.base,
    width: '100%',
    backgroundColor: colors.surface,
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

  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mapBtnWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.terracotta,
  },
  mapBtnCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  plusIcon: { width: 40, height: 40 },
  plusBarH: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
  plusBarV: {
    position: 'absolute',
    left: 18,
    top: 0,
    width: 4,
    height: 40,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
  pressedScale: { transform: [{ scale: 1.05 }] },
  mapHint: { ...ui.buttonLabel, color: colors.white },
  nearError: { ...ui.metadata, color: colors.body, textAlign: 'center', maxWidth: 260 },

  circleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  circleItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lift: { transform: [{ translateY: -3 }] },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    fontSize: 10,
    paddingHorizontal: 5,
    textAlign: 'center',
    color: colors.white,
    fontWeight: '700',
    textShadowColor: 'rgba(70,26,10,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  glassCircle: { backgroundColor: colors.glassFill, borderWidth: 1, borderColor: colors.glassBorder },
  inkLabel: { ...ui.buttonLabel, fontSize: 10, paddingHorizontal: 5, color: colors.ink, textAlign: 'center' },
  storiesCircle: { backgroundColor: colors.terracotta },
  storiesLabel: {
    ...ui.buttonLabel,
    fontSize: 10,
    paddingHorizontal: 5,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },

  bottom: {
    width: '100%',
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
