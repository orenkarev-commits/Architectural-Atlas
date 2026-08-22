import React, { forwardRef } from 'react';
import MapView, { MapViewProps, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle, mapUiProps } from '../lib/mapStyle';
import { colors } from '../theme/tokens';

/**
 * Shared map wrapper — every map instance in the app uses the same warm
 * Google Maps style (see lib/mapStyle.ts) so the map feels part of the app.
 */
export const MapStyled = forwardRef<MapView, MapViewProps>(function MapStyled(
  { style, children, ...rest },
  ref
) {
  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      customMapStyle={mapStyle}
      {...mapUiProps}
      style={[{ backgroundColor: colors.mapTile }, style]}
      {...rest}
    >
      {children}
    </MapView>
  );
});
