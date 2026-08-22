import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { buildings } from '../data/buildings';
import { distanceKm } from '../lib/distance';

interface AtlasState {
  /** Story-trio rotation offset — advances by 3 only on return to Welcome. */
  pickStart: number;
  advanceStories: () => void;

  filterStyle: string | null;
  setFilterStyle: (style: string | null) => void;

  /** Building id -> distance in km, populated by a successful "Near me". */
  nearOrder: Record<number, number> | null;
  /** The device's last known coordinate, for bearings (compass). Null until located. */
  userLocation: { lat: number; lng: number } | null;
  nearBusy: boolean;
  nearError: string | null;
  geoOffline: boolean;
  findNearMe: () => Promise<boolean>;
}

const AtlasContext = createContext<AtlasState | undefined>(undefined);

const LOCATION_TIMEOUT_MS = 8000;

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const [pickStart, setPickStart] = useState(0);
  const [filterStyle, setFilterStyle] = useState<string | null>(null);
  const [nearOrder, setNearOrder] = useState<Record<number, number> | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearBusy, setNearBusy] = useState(false);
  const [nearError, setNearError] = useState<string | null>(null);
  const [geoOffline, setGeoOffline] = useState(false);

  const advanceStories = useCallback(() => {
    setPickStart((p) => p + 3);
  }, []);

  const findNearMe = useCallback(async () => {
    setNearBusy(true);
    setNearError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setGeoOffline(true);
        setNearError('Location permission denied — search by address instead.');
        return false;
      }

      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), LOCATION_TIMEOUT_MS)
        ),
      ]);

      const here = { lat: position.coords.latitude, lng: position.coords.longitude };
      const order: Record<number, number> = {};
      for (const building of buildings) {
        order[building.id] = distanceKm(here, building.resolved);
      }
      setNearOrder(order);
      setUserLocation(here);
      setGeoOffline(false);
      return true;
    } catch (error) {
      setGeoOffline(true);
      if (error instanceof Error && error.message === 'timeout') {
        setNearError('Location request timed out — search by address instead.');
      } else {
        setNearError('Location unavailable on this device — search by address instead.');
      }
      return false;
    } finally {
      setNearBusy(false);
    }
  }, []);

  const value = useMemo<AtlasState>(
    () => ({
      pickStart,
      advanceStories,
      filterStyle,
      setFilterStyle,
      nearOrder,
      userLocation,
      nearBusy,
      nearError,
      geoOffline,
      findNearMe,
    }),
    [pickStart, advanceStories, filterStyle, nearOrder, userLocation, nearBusy, nearError, geoOffline, findNearMe]
  );

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}

export function useAtlas(): AtlasState {
  const ctx = useContext(AtlasContext);
  if (!ctx) throw new Error('useAtlas must be used within an AtlasProvider');
  return ctx;
}
