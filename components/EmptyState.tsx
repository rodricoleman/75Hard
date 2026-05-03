import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors } from '@/theme/colors';
import { font, fontFamily, spacing } from '@/theme/tokens';

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
      <View style={styles.bubble}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xl },
  bubble: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 40 },
  title: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  body: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    fontFamily: fontFamily.body as any,
    lineHeight: 20,
  },
});
