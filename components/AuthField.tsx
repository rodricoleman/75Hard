import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';

type Props = TextInputProps & { label: string };

export function AuthField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={colors.textDim}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
});
