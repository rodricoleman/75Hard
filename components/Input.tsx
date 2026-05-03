import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';

export function Input({
  label,
  hint,
  ...rest
}: TextInputProps & { label?: string; hint?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textDim}
        style={styles.input}
        {...rest}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginBottom: spacing.xs,
    fontWeight: font.weight.medium,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.size.md,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: spacing.xs,
  },
});
