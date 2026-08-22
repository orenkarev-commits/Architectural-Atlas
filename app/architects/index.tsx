import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../../components/BackButton';
import { ArchitectRow } from '../../components/ArchitectRow';
import { CompassDial } from '../../components/CompassDial';
import { architects } from '../../data/architects';
import { buildings } from '../../data/buildings';
import { colors, spacing } from '../../theme/tokens';
import { editorial } from '../../theme/typography';

export default function ArchitectsIndex() {
  const [hovered, setHovered] = useState<string | null>(null);

  // The one compass at the head of the list aims at the hovered architect's
  // nearest building; with nothing hovered it aims at the nearest building overall.
  const compassBuildings = useMemo(() => {
    if (hovered) {
      const own = buildings.filter((b) => b.architect === hovered);
      if (own.length > 0) return own;
    }
    return buildings;
  }, [hovered]);

  return (
    <View style={styles.container}>
      <BackButton />
      <FlatList
        data={architects}
        keyExtractor={(item) => item.name}
        extraData={hovered}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Architects</Text>
            <View style={styles.compassWrap}>
              <CompassDial buildings={compassBuildings} showDistance={false} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ArchitectRow
            architect={item}
            active={hovered === item.name}
            onHoverIn={() => setHovered(item.name)}
            onHoverOut={() => setHovered((h) => (h === item.name ? null : h))}
            onPress={() => router.push({ pathname: '/architects/[name]', params: { name: item.name } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.base }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  header: {
    paddingTop: 52,
    marginBottom: spacing.xxl,
  },
  title: {
    ...editorial.screenHeader,
    color: colors.ink,
    // Sits beside the floating back button rather than under it.
    marginLeft: 46,
  },
  compassWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
