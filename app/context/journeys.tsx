import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../../components/BackButton';
import { colors, spacing } from '../../theme/tokens';
import { ui } from '../../theme/typography';

const MAP = require('../../assets/images/journeys-map.jpg');
const AR = 2133 / 3200; // width / height

/**
 * The Architects' Circle — where each architect was born, studied in Europe, and
 * settled in Palestine. Shown as a high-resolution, pinch-zoomable image for now;
 * the live interactive map returns with the next native build.
 */
export default function JourneysMap() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const imgW = width;
  const imgH = width / AR;

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingTop: insets.top + 44, paddingBottom: insets.bottom + 40 }}
        maximumZoomScale={4}
        minimumZoomScale={1}
        bouncesZoom
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>Pinch to zoom · drag to pan</Text>
        <Image source={MAP} style={{ width: imgW, height: imgH }} resizeMode="contain" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c1020' },
  flex: { flex: 1 },
  hint: {
    ...ui.metadataSmall,
    color: 'rgba(243,239,230,0.6)',
    textAlign: 'center',
    paddingBottom: spacing.sm,
  },
});
