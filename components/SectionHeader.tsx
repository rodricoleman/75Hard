import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  emoji,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  emoji?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} style={styles.actionWrap}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 18 },
  title: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.2,
  },
  actionWrap: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  action: {
    color: colors.primaryDark,
    fontSize: font.size.xs,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.3,
  },
});
