import { useEffect } from 'react';
import Svg, { Circle, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { day: number; total: number; progress: number };

export function DayRing({ day, total, progress }: Props) {
  const size = 188;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - p.value),
  }));

  const center = size / 2;
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const inner = r - stroke / 2 - 8;
    const outer = r - stroke / 2 - 3;
    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * outer;
    const y2 = center + Math.sin(angle) * outer;
    return { x1, y1, x2, y2, emphasis: i % 5 === 0 };
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]} />
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E6FF66" />
            <Stop offset="50%" stopColor={colors.neon} />
            <Stop offset="100%" stopColor="#9ACC00" />
          </LinearGradient>
        </Defs>
        <G>
          {ticks.map((t, i) => (
            <Line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.emphasis ? colors.borderStrong : colors.border}
              strokeWidth={t.emphasis ? 1.4 : 0.8}
            />
          ))}
        </G>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={r}
          stroke="url(#ring)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.eyebrow}>DIA</Text>
        <Text style={styles.day}>{String(day).padStart(2, '0')}</Text>
        <View style={styles.divider} />
        <Text style={styles.total}>DE {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    backgroundColor: colors.neonSoft,
    opacity: 0.6,
    transform: [{ scale: 0.7 }],
  },
  center: { position: 'absolute', alignItems: 'center' },
  eyebrow: {
    ...type.eyebrow,
    color: colors.neon,
  },
  day: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -3,
    lineHeight: 68,
    marginTop: 2,
  },
  divider: {
    width: 28,
    height: 2,
    backgroundColor: colors.neon,
    marginVertical: 4,
    opacity: 0.6,
  },
  total: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
});
