import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              styles.seg,
              active && { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                styles.segText,
                {
                  color: active ? colors.text : colors.textMuted,
                  fontWeight: active ? '700' : '500',
                },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  seg: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  segText: {
    fontSize: font.size.sm,
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.2,
  },
});
