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

module.exports = config;
