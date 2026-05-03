import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
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
  const points = values
    .map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`)
    .join(' ');
  const lastY = height - ((values[values.length - 1] - min) / span) * height;

  return (
    <Svg width={width} height={height}>
      <Line x1={0} y1={height} x2={width} y2={height} stroke={colors.border} strokeWidth={1} />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Circle cx={width} cy={lastY} r={3.5} fill={color} />
    </Svg>
  );
}
