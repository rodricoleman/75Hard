import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  value: number;
  step: number;
  goal: number;
  suffix?: string;
  onChange: (v: number) => void;
};

export function CounterInput({ value, step, goal, suffix = '', onChange }: Props) {
  const done = value >= goal;
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(0, value - step))}
        style={styles.btn}
      >
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.value, done && { color: colors.neon }]}>
        {value}
        {suffix}
      </Text>
      <TouchableOpacity onPress={() => onChange(value + step)} style={styles.btn}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.text, fontSize: 22, fontWeight: '700' },
  value: { color: colors.text, fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
