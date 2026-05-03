import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
import { formatCoin } from '@/lib/economy';

export function CoinBadge({
  amount,
  size = 'md',
  sign = false,
  style,
}: {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  sign?: boolean;
  style?: ViewStyle;
}) {
  const fontSize = size === 'lg' ? font.size.xl : size === 'sm' ? font.size.sm : font.size.md;
  const sign_ = sign ? (amount >= 0 ? '+' : '') : '';
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.coin, { fontSize }]}>◉</Text>
      <Text style={[styles.text, { fontSize, color: amount < 0 ? colors.danger : colors.coin }]}>
        {sign_}
        {formatCoin(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  coin: { color: colors.coin, fontWeight: '700' },
  text: { fontWeight: '700' },
});
