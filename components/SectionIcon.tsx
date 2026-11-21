import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';

export type SectionIconName =
  | 'story'
  | 'matters'
  | 'life'
  | 'materials'
  | 'archive'
  | 'architect';

/**
 * Bauhaus section icons — primary shapes in two tones (a nod to the White City's
 * roots), matching the Atlas tiles. `color` is the solid fill; `tint` is the
 * lighter second tone and defaults to white on dark/active surfaces.
 */
export function SectionIcon({
  name,
  size = 18,
  color = colors.terracotta,
  tint,
}: {
  name: SectionIconName;
  size?: number;
  color?: string;
  tint?: string;
}) {
  const isWhite = color.toUpperCase() === colors.white.toUpperCase() || color.toLowerCase() === 'white';
  const t = tint ?? (isWhite ? 'rgba(255,255,255,0.42)' : 'rgba(194,83,31,0.22)');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'story' && (
        <>
          <Circle cx={8} cy={8} r={5} fill={t} />
          <Path
            d="M7 6.6c-1 .2-1.7 1-1.7 2 0 .9.7 1.6 1.6 1.6.2 0 .3 0 .5-.1-.2 1-.9 1.7-1.8 2 .1.5.2.7.2.7 1.8-.4 3-1.9 3-3.9 0-1.3-.9-2.3-2.1-2.3Z"
            fill={color}
          />
          <Rect x={10.5} y={14} width={10} height={2.1} rx={1} fill={color} />
          <Rect x={10.5} y={17.6} width={7} height={2.1} rx={1} fill={t} />
        </>
      )}
      {name === 'matters' && (
        <>
          <Path d="M12 3 L19.5 12 L12 21 L4.5 12 Z" fill={t} />
          <Circle cx={12} cy={12} r={3.1} fill={color} />
        </>
      )}
      {name === 'life' && (
        <>
          <Circle cx={12} cy={12} r={8} fill={t} />
          <Path d="M12 12 V4 A8 8 0 0 1 20 12 Z" fill={color} />
          <Circle cx={12} cy={12} r={1.9} fill={color} />
        </>
      )}
      {name === 'materials' && (
        <>
          <Rect x={3} y={6} width={7.5} height={4.4} rx={0.6} fill={color} />
          <Rect x={11.5} y={6} width={9.5} height={4.4} rx={0.6} fill={t} />
          <Rect x={5.5} y={11.4} width={9.5} height={4.4} rx={0.6} fill={t} />
          <Rect x={16} y={11.4} width={5} height={4.4} rx={0.6} fill={color} />
        </>
      )}
      {name === 'archive' && (
        <>
          <Rect x={4} y={6.5} width={12} height={13.5} rx={1.4} fill={t} />
          <Rect x={8} y={3} width={12} height={13.5} rx={1.4} fill={color} />
        </>
      )}
      {name === 'architect' && (
        <>
          <Path d="M12 4 L18.5 19 L5.5 19 Z" fill={t} />
          <Circle cx={12} cy={7.2} r={2.4} fill={color} />
        </>
      )}
    </Svg>
  );
}
