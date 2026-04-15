import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/tokens';

type Props = {
  value: number;
  step: number;
  goal: number;
  suffix?: string;
  onChange: (v: number) => void;
};

function PressBtn({
  onPress,
  children,
  disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => (s.value = withTiming(0.88, { duration: 80 }))}
      onPressOut={() => (s.value = withTiming(1, { duration: 120 }))}
      hitSlop={6}
    >
      <Animated.View style={[styles.btn, disabled && styles.btnDisabled, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function CounterInput({ value, step, goal, suffix = '', onChange }: Props) {
  const done = value >= goal;
  const fireHaptic = () => {
    if (Platform.OS === 'web') return;
    try {
      const H = require('expo-haptics');
      H?.selectionAsync?.();
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      <PressBtn
        disabled={value === 0}
        onPress={() => {
          fireHaptic();
          onChange(Math.max(0, value - step));
        }}
      >
        <Text style={[styles.btnText, value === 0 && { color: colors.textDim }]}>−</Text>
      </PressBtn>
      <View style={[styles.valueBox, done && styles.valueBoxDone]}>
        <Text style={[styles.value, done && { color: colors.neon }]}>
          {value}
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </Text>
      </View>
      <PressBtn
        onPress={() => {
          fireHaptic();
          onChange(value + step);
        }}
      >
        <Text style={styles.btnText}>+</Text>
      </PressBtn>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.text, fontSize: 20, fontWeight: '800', lineHeight: 22 },
  valueBox: {
    minWidth: 64,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBoxDone: { backgroundColor: 'transparent' },
  value: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  suffix: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
