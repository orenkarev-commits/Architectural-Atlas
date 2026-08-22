import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { CircularOverviewMap } from '../../components/CircularOverviewMap';
import { BuildingRow } from '../../components/BuildingRow';
import { useAtlas } from '../../context/AtlasContext';
import { buildings } from '../../data/buildings';
import type { Building, BuildingStyle } from '../../data/types';
import { timelineStyles, periodForStyle, styleByName } from '../../data/styles';
import { parseYear } from '../../lib/year';
import { colors, radii, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

const sortYear = (b: Building) => {
  const y = parseYear(b.year);
  return y === 0 ? Infinity : y;
};

export default function Atlas() {
  const { style: styleParam } = useLocalSearchParams<{ style?: string }>();
  const { setFilterStyle, nearOrder, geoOffline } = useAtlas();
  const [periodName, setPeriodName] = useState<string | null>(null);

  // A style badge tapped elsewhere deep-links here → select that category.
  useEffect(() => {
    if (!styleParam) return;
    setFilterStyle(styleParam);
    const p = periodForStyle(styleParam as BuildingStyle);
    setPeriodName(p?.name ?? styleParam);
  }, [styleParam, setFilterStyle]);

  const activePeriod = periodName ? styleByName(periodName) : undefined;

  const visible = useMemo(() => {
    if (!activePeriod) return buildings;
    const match = activePeriod.matchStyles ?? [];
    return buildings.filter((b) => match.includes(b.style));
  }, [activePeriod]);

  const sorted = useMemo(() => {
    if (nearOrder) {
      return [...visible].sort((a, b) => (nearOrder[a.id] ?? Infinity) - (nearOrder[b.id] ?? Infinity));
    }
    return [...visible].sort((a, b) => sortYear(a) - sortYear(b));
  }, [visible, nearOrder]);

  const headerRight = nearOrder
    ? geoOffline
      ? 'Nearest · stored coordinates'
      : 'Nearest to you'
    : `${sorted.length} of ${buildings.length}`;

  const goToBuilding = (building: Building) => {
    router.push({ pathname: '/locating', params: { buildingId: String(building.id) } });
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Atlas</Text>
              <Text style={styles.headerRight}>{headerRight}</Text>
            </View>

            {/* Knowledge area — the Atlas as a cumulative source */}
            <View style={styles.knowledgeRow}>
              <Pressable onPress={() => router.push('/dictionary')} hitSlop={6}>
                <Text style={styles.knowledgeLink}>Dictionary</Text>
              </Pressable>
              <Text style={styles.knowledgeDot}>·</Text>
              <Pressable onPress={() => router.push('/innovations')} hitSlop={6}>
                <Text style={styles.knowledgeLink}>Innovations</Text>
              </Pressable>
              <Text style={styles.knowledgeDot}>·</Text>
              <Pressable onPress={() => router.push('/materials')} hitSlop={6}>
                <Text style={styles.knowledgeLink}>Materials</Text>
              </Pressable>
            </View>

            <CircularOverviewMap
              buildings={Platform.OS === 'web' || activePeriod ? visible : buildings}
              frameBuildings={buildings}
              onSelect={goToBuilding}
            />

            {/* By style — the categories are the building classifications */}
            <View style={styles.chips}>
              <Pressable
                onPress={() => setPeriodName(null)}
                style={[styles.chip, !activePeriod && styles.chipOn]}
              >
                <Text style={[styles.chipText, !activePeriod && styles.chipTextOn]}>All</Text>
              </Pressable>
              {timelineStyles.map((s) => {
                const on = activePeriod?.name === s.name;
                return (
                  <Pressable
                    key={s.name}
                    onPress={() => setPeriodName(s.name)}
                    onLongPress={() => router.push({ pathname: '/style/[name]', params: { name: s.name } })}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{s.name}</Text>
                    {s.transitional ? <Text style={styles.chipTag}>transitional</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <BuildingRow
            building={item}
            distanceKm={nearOrder ? nearOrder[item.id] : undefined}
            onPress={() => goToBuilding(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.base }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  listContent: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    marginLeft: 46,
    marginBottom: spacing.sm,
  },
  title: { ...editorial.screenHeader, color: colors.ink },
  headerRight: { ...ui.metadataSmall, color: colors.muted },
  knowledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  knowledgeLink: { ...editorial.cardTitle, fontSize: 15, color: colors.terracotta },
  knowledgeDot: { ...ui.body, color: colors.muted },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipOn: { backgroundColor: colors.surfaceTint, borderColor: colors.terracotta },
  chipText: { ...editorial.cardTitle, fontSize: 14, color: colors.muted },
  chipTextOn: { color: colors.ink },
  chipTag: { ...ui.metadataSmall, fontSize: 9, color: colors.terracotta },
});
