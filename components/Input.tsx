import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';

export function Input({
  label,
  hint,
  ...rest
}: TextInputProps & { label?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textDim}
        style={[
          styles.input,
          focused && {
            borderColor: colors.primary,
            backgroundColor: '#FFFEFB',
          },
        ]}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
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
    marginBottom: spacing.xs + 2,
    fontWeight: font.weight.semibold,
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1.5,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: font.size.md,
    fontFamily: fontFamily.body as any,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: spacing.xs,
    fontFamily: fontFamily.body as any,
  },
});
