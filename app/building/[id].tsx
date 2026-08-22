import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Marker } from 'react-native-maps';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MapStyled } from '../../components/MapStyled';
import { BackButton } from '../../components/BackButton';
import { Badge } from '../../components/Badge';
import { SectionLabel } from '../../components/SectionLabel';
import { PrimaryButton } from '../../components/PrimaryButton';
import { buildings } from '../../data/buildings';
import { architects } from '../../data/architects';
import { plansForBuilding, type Plan } from '../../data/plans';
import { PlanViewer } from '../../components/PlanViewer';
import { toLatLng, toRegion } from '../../lib/coords';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

const MAP_HEIGHT = 300;
const SHEET_OVERLAP = 28;

const PLAN_KIND_LABEL: Record<string, string> = {
  plan: 'Floor plan',
  elevation: 'Elevation',
  section: 'Section',
  site: 'Survey sheet',
};

export default function BuildingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const building = buildings.find((b) => String(b.id) === id);
  const architect = building ? architects.find((a) => a.name === building.architect) : undefined;
  const plans = building ? plansForBuilding(building.id) : [];
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [photoBig, setPhotoBig] = useState(false);

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Pressable onPress={() => setPhotoBig(true)}>
              <Image source={building.image} style={styles.photo} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.name}>{building.name}</Text>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/map', params: { focus: String(building.id) } })
                }
                hitSlop={6}
              >
                <Text style={styles.address}>{building.address}</Text>
              </Pressable>
              <View style={styles.badgeRow}>
                <Badge
                  label={building.style}
                  variant="style"
                  onPress={() =>
                    router.push({ pathname: '/atlas', params: { style: building.style } })
                  }
                />
                <Badge label={String(building.year)} variant="year" />
                {building.styleNote ? <Badge label={building.styleNote} variant="note" /> : null}
              </View>
            </View>
          </View>

          <Pressable
            style={styles.architectButton}
            disabled={!architect}
            onPress={() => {
              if (architect) {
                router.push({ pathname: '/architects/[name]', params: { name: architect.name } });
              }
            }}
          >
            <Text style={styles.architectLabel}>Architect</Text>
            <Text style={styles.architectName}>{building.architect}</Text>
          </Pressable>

          <View style={styles.section}>
            <SectionLabel>Why it matters</SectionLabel>
            <Text style={styles.prose}>{building.innovation}</Text>
          </View>

          {building.materials ? (
            <View style={styles.section}>
              <SectionLabel>Materials & construction</SectionLabel>
              <Text style={styles.prose}>{building.materials}</Text>
            </View>
          ) : null}

          {building.timeline && building.timeline.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel>Life of the building</SectionLabel>
              <View style={styles.timeline}>
                {building.timeline.map((t, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <Text style={styles.timelineYear}>{t.year}</Text>
                    <Text style={styles.timelineNote}>{t.note}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {plans.length > 0 && (
            <View style={styles.section}>
              <SectionLabel>From the archive</SectionLabel>
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
            </View>
          )}

          <View style={styles.threadBlock}>
            <SectionLabel>Research thread</SectionLabel>
            <Text style={styles.threadText}>{building.thread}</Text>
          </View>

          <PrimaryButton label="Open in Field research" onPress={() => router.push('/field')} />
        </Animated.View>
      </ScrollView>

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
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
    gap: spacing.xxl,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.hairline,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  photo: {
    width: 92,
    height: 116,
    borderRadius: radii.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...editorial.buildingName,
    color: colors.ink,
  },
  address: {
    ...ui.metadata,
    color: colors.terracottaTextOnTint,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  architectButton: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  architectLabel: {
    ...ui.label,
    color: colors.label,
  },
  architectName: {
    ...editorial.cardTitleLg,
    fontSize: 17,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  prose: {
    ...ui.body,
    color: colors.body,
  },
  timeline: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineYear: {
    ...ui.label,
    color: colors.terracotta,
    width: 68,
    paddingTop: 1,
  },
  timelineNote: {
    ...ui.body,
    flex: 1,
    color: colors.body,
  },
  planBlock: {
    gap: spacing.xs,
    marginTop: spacing.xs,
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
  threadBlock: {
    backgroundColor: '#F5EFE7',
    borderLeftWidth: 3,
    borderLeftColor: colors.terracotta,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  threadText: {
    ...editorial.cardTitle,
    fontSize: 15,
    color: colors.inkSoft,
  },
});
