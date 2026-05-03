import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

const MAX_CONTENT_W = 520;

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const { width } = useWindowDimensions();
  const horizontalPad =
    width > MAX_CONTENT_W ? Math.max(spacing.lg, (width - MAX_CONTENT_W) / 2) : spacing.lg;

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={['top']}>
        <View style={[styles.inner, { paddingHorizontal: horizontalPad }]}>{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollInner,
          { paddingHorizontal: horizontalPad },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1 },
  scrollInner: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
});
