import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { type } from '@/theme/tokens';

type Props = {
  label: string;
  hint?: string;
  done: boolean;
  onToggle: () => void;
  right?: React.ReactNode;
  icon?: string;
};

export function TaskRow({ label, hint, done, onToggle, right, icon }: Props) {
  const scale = useSharedValue(done ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(done ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [done]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const fireHaptic = () => {
    if (Platform.OS === 'web') return;
    try {
      const Haptics = require('expo-haptics');
      if (Haptics?.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const handlePress = () => {
    fireHaptic();
    onToggle();
  };

  return (
    <Animated.View style={[styles.row, done && styles.rowDone, rowStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (press.value = withTiming(0.98, { duration: 80 }))}
        onPressOut={() => (press.value = withSpring(1))}
        style={styles.touchArea}
        hitSlop={8}
      >
        <View style={[styles.check, done && styles.checkOn]}>
          <Animated.View style={[styles.checkInner, checkStyle]}>
            <Text style={styles.mark}>✓</Text>
          </Animated.View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.labelRow}>
            {icon ? <Text style={styles.icon}>{icon}</Text> : null}
            <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
          </View>
          {hint ? (
            <Text style={[styles.hint, done && { color: colors.neonDim }]}>{hint}</Text>
          ) : null}
        </View>
      </Pressable>
      {right}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 10,
  },
  rowDone: {
    backgroundColor: colors.neonSoft,
    borderColor: colors.neonDim,
  },
  touchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkOn: {
    backgroundColor: colors.neon,
    borderColor: colors.neon,
  },
  checkInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { color: '#000', fontWeight: '900', fontSize: 16, lineHeight: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 14 },
  label: { ...type.bodyStrong, color: colors.text, fontSize: 15 },
  labelDone: { color: colors.text, opacity: 0.55 },
  hint: { ...type.caption, color: colors.textDim, marginTop: 3 },
});
