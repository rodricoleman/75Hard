import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  label: string;
  hint?: string;
  done: boolean;
  onToggle: () => void;
  right?: React.ReactNode;
};

export function TaskRow({ label, hint, done, onToggle, right }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onToggle} style={styles.row}>
      <View style={[styles.check, done && styles.checkOn]}>
        {done && <Text style={styles.mark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 10,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.neon, borderColor: colors.neon },
  mark: { color: '#000', fontWeight: '900' },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  labelDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  hint: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
