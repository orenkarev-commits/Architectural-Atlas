import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpandingSearchInput } from '../components/ExpandingSearchInput';
import { MotionGradient } from '../components/MotionGradient';
import { buildings } from '../data/buildings';
import { architects } from '../data/architects';
import { suggest, type Suggestion } from '../lib/search';
import { useAtlas } from '../context/AtlasContext';
import { colors, radii, spacing } from '../theme/tokens';
import { editorial, ui } from '../theme/typography';

const CREAM = '#FBF3EA';

/** The Atlas line-mark (pointed-arch façade), drawn in cream with no icon surround — fine lineweight. */
function LogoMark({ size = 60 }: { size?: number }) {
  const p = {
    stroke: CREAM,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d="M30 96 V46 H90 V96" strokeWidth={3.1} {...p} />
      <Path d="M30 46 V40 H38 V46 M46 46 V40 H54 V46 M62 46 V40 H70 V46 M78 46 V40 H86 V46" strokeWidth={2.2} {...p} />
      <Path d="M52 96 V70 Q52 54 60 50 Q68 54 68 70 V96" strokeWidth={3.1} {...p} />
      <Path d="M38 96 V76 Q38 66 43 63 Q48 66 48 76 V96" strokeWidth={2.2} {...p} />
      <Path d="M72 96 V76 Q72 66 77 63 Q82 66 82 76 V96" strokeWidth={2.2} {...p} />
    </Svg>
  );
}

/** A pulsing ring behind the map button. */
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

export default function Welcome() {
  const [query, setQuery] = useState('');
  const { findNearMe, nearError } = useAtlas();
  const insets = useSafeAreaInsets();

  const fade = useSharedValue(0);
  const hasFadedOnce = useRef(false);
  useEffect(() => {
    if (!hasFadedOnce.current) {
      fade.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
      hasFadedOnce.current = true;
    }
  }, [fade]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

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
    Keyboard.dismiss();
  };

  const onOpenMap = () => {
    void findNearMe();
    router.push('/map');
  };

  return (
    <MotionGradient variant="sunset">
      <Animated.View
        style={[
          styles.screen,
          fadeStyle,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Top: identity + search */}
        <View style={styles.top}>
          <LogoMark size={58} />
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

        {/* Middle: the pulsing map button, then the Atlas button */}
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

          <Pressable
            onPress={() => router.push('/atlas')}
            style={({ pressed }) => [styles.atlasBtn, pressed && styles.pressedScale]}
          >
            <Text style={styles.atlasBtnLabel}>Open the Atlas</Text>
          </Pressable>
        </View>
      </Animated.View>
    </MotionGradient>
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
    backgroundColor: CREAM,
    opacity: 0.9,
    marginTop: 12,
    marginBottom: 14,
  },
  title: {
    ...editorial.welcomeTitle,
    color: CREAM,
    textAlign: 'center',
  },
  titleThe: {
    fontSize: 20,
    color: 'rgba(251,243,234,0.78)',
  },
  standfirst: {
    ...ui.bodyLarge,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(251,243,234,0.88)',
    maxWidth: 260,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  searchWrap: {
    marginTop: spacing.xl,
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
    gap: spacing.lg,
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
    backgroundColor: CREAM,
  },
  // Glass map button with a soft drop shadow (Apple-like) over the gradient.
  mapBtnCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A0E00',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  plusIcon: { width: 40, height: 40 },
  plusBarH: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: CREAM,
  },
  plusBarV: {
    position: 'absolute',
    left: 18,
    top: 0,
    width: 4,
    height: 40,
    borderRadius: 2,
    backgroundColor: CREAM,
  },
  pressedScale: { transform: [{ scale: 1.05 }] },
  mapHint: { ...ui.buttonLabel, color: CREAM },
  nearError: { ...ui.metadata, color: CREAM, textAlign: 'center', maxWidth: 260 },

  // The primary Atlas button — solid sunset-orange, centred, with a drop shadow.
  atlasBtn: {
    marginTop: spacing.sm,
    minWidth: 220,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 15,
    borderRadius: radii.circle,
    backgroundColor: '#C2531F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A0A00',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  atlasBtnLabel: {
    ...ui.buttonLabel,
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.white,
    fontWeight: '700',
  },
});
