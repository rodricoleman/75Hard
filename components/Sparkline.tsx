import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '@/theme/colors';

export function Sparkline({
  values,
  width = 320,
  height = 80,
  color = colors.coin,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (values.length < 2) {
    return <View style={{ height, width }} />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const stepX = width / (values.length - 1);

  const coords = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / span) * (height - 6) - 3,
  }));

  const points = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Filled area under the curve for soft fill
  const areaPath =
    `M ${coords[0].x.toFixed(1)} ${height} ` +
    coords.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${height} Z`;

  const lastY = coords[coords.length - 1].y;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.35" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#sparkFill)" />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={width} cy={lastY} r={5} fill={color} stroke="#FFF" strokeWidth={2} />
    </Svg>
  );
}
