import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';
import { formatCoin } from '@/lib/economy';

export function CoinBadge({
  amount,
  size = 'md',
  sign = false,
  style,
  pill = false,
}: {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  sign?: boolean;
  style?: ViewStyle;
  pill?: boolean;
}) {
  const fontSize = size === 'lg' ? font.size.xxl : size === 'sm' ? font.size.sm : font.size.md;
  const dotSize = size === 'lg' ? 14 : size === 'sm' ? 8 : 11;
  const sign_ = sign ? (amount >= 0 ? '+' : '') : '';
  const color = amount < 0 ? colors.danger : colors.coin;

  if (pill) {
    return (
      <View
        style={[
          styles.pill,
          { backgroundColor: amount < 0 ? colors.dangerSoft : colors.coinSoft },
          style,
        ]}
      >
        <View style={[styles.dot, { width: dotSize, height: dotSize, backgroundColor: color }]} />
        <Text
          style={[
            styles.pillText,
            { color: amount < 0 ? '#A24452' : '#7E5F1A', fontSize: fontSize - 1 },
          ]}
        >
          {sign_}
          {formatCoin(amount)}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.dot, { width: dotSize, height: dotSize, backgroundColor: color }]} />
      <Text style={[styles.text, { fontSize, color: amount < 0 ? colors.danger : '#A87B14' }]}>
        {sign_}
        {formatCoin(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  dot: { borderRadius: 999 },
  text: {
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: 0.3,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pillText: {
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
  },
});
