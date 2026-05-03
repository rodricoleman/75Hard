import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';

export function EmptyState({
  emoji,
  title,
  body,
  actionLabel,
  onAction,
}: {
  emoji: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
