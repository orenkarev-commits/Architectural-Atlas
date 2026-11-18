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
 * Line icons for the building-page section topics, drawn to match the
 * conservation-dossier voice. Monochrome and tinted terracotta by default.
 */
export function SectionIcon({
  name,
  size = 18,
  color = colors.terracotta,
}: {
  name: SectionIconName;
  size?: number;
  color?: string;
}) {
  const p = {
    stroke: color,
    strokeWidth: 1.7,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'story' && (
        <>
          <Path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1V5z" {...p} />
          <Path d="M12 7v12" {...p} />
        </>
      )}
      {name === 'matters' && (
        <Path d="M12 3l1.7 6 6 1.7-6 1.7L12 18l-1.7-5.6-6-1.7 6-1.7z" {...p} />
      )}
      {name === 'life' && (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Path d="M12 8v4l3 2" {...p} />
        </>
      )}
      {name === 'materials' && (
        <>
          <Rect x={3.5} y={7} width={17} height={10} rx={1} {...p} />
          <Path d="M3.5 12h17M10 7v5M15 12v5" {...p} />
        </>
      )}
      {name === 'archive' && (
        <>
          <Path d="M5.5 4h8l5 5v11h-13z" {...p} />
          <Path d="M13.5 4v5h5" {...p} />
          <Path d="M8.5 13h7M8.5 16h5" {...p} />
        </>
      )}
      {name === 'architect' && (
        <>
          <Circle cx={12} cy={6} r={2} {...p} />
          <Path d="M11 8l-4 12M13 8l4 12M8.5 17h7" {...p} />
        </>
      )}
    </Svg>
  );
}
