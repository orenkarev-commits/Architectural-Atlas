const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-maps has no web implementation. For the browser preview only,
// resolve it to a placeholder so the non-map screens can still be viewed.
// Native platforms resolve the real package untouched.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// The Photo Studio companion server (studio/) is a Node tool with its own
// node_modules; keep Metro from crawling or bundling it.
const studioDir = path
  .resolve(__dirname, 'studio')
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  new RegExp(`^${studioDir}[\\\\/].*`),
];

// Let Metro bundle .html files as assets (for the WebView journeys map).
config.resolver.assetExts.push('html');

module.exports = config;
