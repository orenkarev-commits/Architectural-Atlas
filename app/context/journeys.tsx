import React, { useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BackButton } from '../../components/BackButton';
import { colors, spacing } from '../../theme/tokens';
import { editorial, ui } from '../../theme/typography';

/**
 * The WebView is a native module added after the current TestFlight build, so on older
 * installs it isn't in the binary and would crash the route. This boundary catches that
 * and shows a friendly notice until the next build ships.
 */
class WebViewBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>Architects’ Journeys</Text>
          <Text style={styles.fallbackBody}>
            This map arrives with the next app update. Install the newest build from TestFlight to explore where
            the Architects’ Circle was born, studied and settled.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// On iOS the WebView loads the HTML from the app bundle via require().
// On Android, assets must be loaded from the file:///android_asset/ path.
const mapHtml =
  Platform.OS === 'ios'
    ? require('../../assets/web/architects-journeys.html')
    : { uri: 'file:///android_asset/web/architects-journeys.html' };

export default function JourneysMap() {
  const webRef = useRef<WebView>(null);

  return (
    <View style={styles.container}>
      <BackButton />
      <WebViewBoundary>
      <WebView
        ref={webRef}
        source={mapHtml}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Let D3 handle all gestures
        scalesPageToFit={false}
        // Dark mode: inject the phone's color scheme
        injectedJavaScriptBeforeContentLoaded={`
          (function() {
            var meta = document.createElement('meta');
            meta.name = 'color-scheme';
            meta.content = '${colors.surface === '#FFFFFF' ? 'light' : 'dark'}';
            document.head.appendChild(meta);
          })();
          true;
        `}
        onMessage={(event) => {
          // Handle messages from the map (e.g. architect tapped)
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ready') {
              // Map loaded successfully
            }
          } catch {}
        }}
      />
      </WebViewBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  fallbackTitle: { ...editorial.cardTitleLg, color: colors.ink, textAlign: 'center' },
  fallbackBody: { ...ui.body, color: colors.muted, textAlign: 'center', maxWidth: 300, lineHeight: 22 },
});
