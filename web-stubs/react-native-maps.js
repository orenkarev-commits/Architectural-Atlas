// Web-only replacement for react-native-maps (native-only). Metro swaps the
// import for this file on web builds (see metro.config.js). Native builds never
// see it. It renders a real interactive slippy map with Leaflet + OpenStreetMap
// (CARTO light tiles, no API key), exposing just the slice of the
// react-native-maps API the Atlas uses: MapView (+ animateToRegion /
// fitToCoordinates / onMapReady) and Marker (coordinate + onPress).
const React = require('react');
const { View, Text } = require('react-native');

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

let leafletPromise = null;
function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LEAFLET_CSS;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = () => reject(new Error('leaflet failed'));
    document.head.appendChild(s);
  });
  return leafletPromise;
}

let pinCssInjected = false;
function injectPinCss() {
  if (pinCssInjected || typeof document === 'undefined') return;
  pinCssInjected = true;
  const style = document.createElement('style');
  style.textContent =
    '.atlas-pin{display:block;width:14px;height:14px;border-radius:50%;' +
    'background:#b4562f;border:2px solid #fff;box-shadow:0 0 0 0 rgba(180,86,47,.5);' +
    'animation:atlasIn .42s cubic-bezier(.34,1.56,.64,1) both,atlasPulse 1.6s ease-out .42s infinite;cursor:pointer}' +
    '@keyframes atlasIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.18);opacity:1}100%{transform:scale(1)}}' +
    '@keyframes atlasPulse{0%{box-shadow:0 0 0 0 rgba(180,86,47,.5)}' +
    '70%{box-shadow:0 0 0 11px rgba(180,86,47,0)}100%{box-shadow:0 0 0 0 rgba(180,86,47,0)}}' +
    // Tour graphics
    '.atlas-stop{display:flex;align-items:center;justify-content:center;width:26px;height:26px;' +
    'border-radius:50%;background:#b4562f;border:2px solid #fff;color:#fff;font-weight:800;' +
    'font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer}' +
    '.atlas-arrow{display:block;color:#b4562f;font-weight:900;font-size:22px;line-height:22px;' +
    'text-shadow:0 0 3px #fff,0 0 3px #fff;animation:atlasFlash .9s ease-in-out infinite}' +
    '@keyframes atlasFlash{0%,100%{opacity:1}50%{opacity:.2}}' +
    '.atlas-current{display:block;width:30px;height:30px;border-radius:50%;border:3px solid #b4562f;' +
    'background:rgba(180,86,47,.18);animation:atlasRing 1.4s ease-out infinite}' +
    '@keyframes atlasRing{0%{transform:scale(1);opacity:1}100%{transform:scale(1.8);opacity:0}}' +
    '.leaflet-marker-icon{transition:opacity .28s ease}' +
    '.leaflet-container{background:#efe9e0;font-family:inherit}';
  document.head.appendChild(style);
}

function zoomFromRegion(region) {
  const delta = (region && region.latitudeDelta) || 0.05;
  const z = Math.log2(360 / delta);
  return Math.max(1, Math.min(19, Math.round(z)));
}

function collectMarkers(children) {
  const out = [];
  React.Children.forEach(children, (child) => {
    if (child && child.type && child.type.__isMarker && child.props) {
      const p = child.props;
      out.push({
        coordinate: p.coordinate,
        onPress: p.onPress,
        opacity: p.opacity,
        role: p.role,
        label: p.label,
        rotation: p.rotation,
      });
    }
  });
  return out;
}

function collectPolylines(children) {
  const out = [];
  React.Children.forEach(children, (child) => {
    if (child && child.type && child.type.__isPolyline && child.props) {
      out.push({
        coordinates: child.props.coordinates || [],
        color: child.props.strokeColor || '#b4562f',
      });
    }
  });
  return out;
}

function iconForRole(L, md) {
  if (md.role === 'stop') {
    return L.divIcon({ className: '', html: '<span class="atlas-stop">' + (md.label || '') + '</span>', iconSize: [26, 26], iconAnchor: [13, 13] });
  }
  if (md.role === 'arrow') {
    const rot = md.rotation || 0;
    return L.divIcon({ className: '', html: '<span class="atlas-arrow" style="transform:rotate(' + rot + 'deg)">↑</span>', iconSize: [24, 24], iconAnchor: [12, 12] });
  }
  if (md.role === 'current') {
    return L.divIcon({ className: '', html: '<span class="atlas-current"></span>', iconSize: [30, 30], iconAnchor: [15, 15] });
  }
  return L.divIcon({ className: '', html: '<span class="atlas-pin"></span>', iconSize: [16, 16], iconAnchor: [8, 8] });
}

// Emergence: stable frame + diff-based markers (pins pop in as they appear).
const MapView = React.forwardRef(function MapView(props, ref) {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  const polylineLayerRef = React.useRef(null);
  const roRef = React.useRef(null);
  const markerMapRef = React.useRef({});
  const [failed, setFailed] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    animateToRegion(region) {
      const m = mapRef.current;
      if (m && region && Number.isFinite(region.latitude) && Number.isFinite(region.longitude)) {
        const z = zoomFromRegion(region);
        try {
          m.setView([region.latitude, region.longitude], Number.isFinite(z) ? z : m.getZoom(), { animate: true });
        } catch (e) {
          /* ignore transient Leaflet animation math */
        }
      }
    },
    fitToCoordinates(coords, opts) {
      const m = mapRef.current;
      if (m && coords && coords.length) {
        const bounds = window.L.latLngBounds(coords.map((c) => [c.latitude, c.longitude]));
        m.fitBounds(bounds, { padding: [46, 46], animate: !!(opts && opts.animated) });
      }
    },
    animateCamera() {},
    fitToSuppliedMarkers() {},
  }));

  const markers = collectMarkers(props.children);
  const polylines = collectPolylines(props.children);
  // Include visibility + tour role/label/rotation so the diff re-runs when any of them change.
  const markerKey = markers
    .map((m) =>
      m.coordinate
        ? `${m.coordinate.latitude},${m.coordinate.longitude}:${m.opacity === 0 ? 0 : 1}:${m.role || ''}:${m.label || ''}:${m.rotation || ''}`
        : ''
    )
    .join('|');
  const polylineKey = polylines
    .map((p) => p.color + '#' + p.coordinates.map((c) => `${c.latitude},${c.longitude}`).join('>'))
    .join('|');

  // Diff markers by coordinate key so only newly-appearing pins are created (and
  // thus animate in) as the emergence slider / category filter changes — existing
  // pins stay put, gone pins are removed. The frame never re-fits, so the view is
  // stable and buildings pop onto a steady map.
  const renderMarkers = React.useCallback(() => {
    const L = window.L;
    const layer = layerRef.current;
    if (!L || !layer) return;
    const existing = markerMapRef.current;
    const next = new Set();
    for (const md of markers) {
      if (!md.coordinate) continue;
      if (!Number.isFinite(md.coordinate.latitude) || !Number.isFinite(md.coordinate.longitude)) continue;
      // Key excludes opacity so a marker is NEVER recreated when it appears/disappears —
      // it stays put and only its opacity fades. That kills the emergence-slider flicker.
      const key = `${md.coordinate.latitude},${md.coordinate.longitude}:${md.role || ''}:${md.label || ''}:${md.rotation || ''}`;
      next.add(key);
      const op = md.opacity === 0 ? 0 : 1;
      let mk = existing[key];
      if (!mk) {
        mk = L.marker([md.coordinate.latitude, md.coordinate.longitude], {
          icon: iconForRole(L, md),
          interactive: true,
          keyboard: false,
        }).addTo(layer);
        if (md.onPress) mk.on('click', md.onPress);
        existing[key] = mk;
      }
      mk.setOpacity(op);
      const el = mk.getElement && mk.getElement();
      if (el) el.style.pointerEvents = op === 0 ? 'none' : 'auto'; // hidden pins aren't clickable
    }
    for (const key of Object.keys(existing)) {
      if (!next.has(key)) {
        layer.removeLayer(existing[key]);
        delete existing[key];
      }
    }
  }, [markerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderPolylines = React.useCallback(() => {
    const L = window.L;
    const layer = polylineLayerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    for (const pl of polylines) {
      const pts = (pl.coordinates || [])
        .filter((c) => c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude))
        .map((c) => [c.latitude, c.longitude]);
      if (pts.length < 2) continue;
      L.polyline(pts, { color: pl.color, weight: 3, opacity: 0.9, dashArray: '8 7', interactive: false }).addTo(layer);
    }
  }, [polylineKey]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        injectPinCss();
        const region = props.initialRegion || {
          latitude: 32.0757,
          longitude: 34.7726,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        const interactive = props.scrollEnabled !== false;
        const zoomable = props.zoomEnabled !== false;
        const map = L.map(containerRef.current, {
          center: [region.latitude, region.longitude],
          zoom: zoomFromRegion(region),
          zoomControl: false,
          attributionControl: true,
          dragging: interactive,
          scrollWheelZoom: zoomable,
          doubleClickZoom: zoomable,
          touchZoom: zoomable,
          boxZoom: false,
          keyboard: false,
        });
        L.tileLayer(TILES, {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '© OpenStreetMap · © CARTO',
        }).addTo(map);
        polylineLayerRef.current = L.layerGroup().addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        // The container often settles its final size a frame or two after the
        // map is created (sheets animate, flex resolves). Re-measure on every
        // size change so tiles fill the whole view, not just the initial box.
        map.invalidateSize();
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
          const ro = new ResizeObserver(() => map.invalidateSize());
          ro.observe(containerRef.current);
          roRef.current = ro;
        }
        [0, 150, 400, 900].forEach((t) => setTimeout(() => map.invalidateSize(), t));
        if (props.onMapReady) props.onMapReady();
        renderPolylines();
        renderMarkers();
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Init once on mount.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  React.useEffect(() => {
    renderPolylines();
  }, [renderPolylines]);

  if (failed) {
    // Tiles unreachable — fall back to the old honest placeholder.
    return React.createElement(
      View,
      { style: [{ backgroundColor: '#F0EBE4', alignItems: 'center', justifyContent: 'center' }, props.style] },
      React.createElement(
        Text,
        { style: { color: '#776A60', fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase' } },
        'Map unavailable offline'
      )
    );
  }

  return React.createElement(
    View,
    { style: props.style },
    React.createElement('div', { ref: containerRef, style: { width: '100%', height: '100%' } })
  );
});

function Marker() {
  return null;
}
Marker.__isMarker = true;

function Polyline() {
  return null;
}
Polyline.__isPolyline = true;

const Noop = function () {
  return null;
};

module.exports = MapView;
module.exports.Marker = Marker;
module.exports.Callout = Noop;
module.exports.Polyline = Polyline;
module.exports.Polygon = Noop;
module.exports.Circle = Noop;
module.exports.Overlay = Noop;
module.exports.PROVIDER_GOOGLE = 'google';
module.exports.PROVIDER_DEFAULT = undefined;
