import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useToast, type Toast as ToastT } from '@/store/useToast';
import { CoinBadge } from './CoinBadge';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadow } from '@/theme/tokens';

const VARIANT_PALETTE: Record<ToastT['variant'], { bg: string; fg: string; accent: string }> = {
  earn: { bg: colors.accentSoft, fg: '#2E6F58', accent: colors.accent },
  lose: { bg: colors.dangerSoft, fg: '#A24452', accent: colors.danger },
  level: { bg: colors.xpSoft, fg: '#5D4A87', accent: colors.xp },
  info: { bg: colors.primarySoft, fg: colors.primaryDark, accent: colors.primary },
  error: { bg: colors.dangerSoft, fg: '#A24452', accent: colors.danger },
};

function ToastView({ toast }: { toast: ToastT }) {
  const ty = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    ty.value = withSpring(0, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(
      withTiming(1.04, { duration: 220 }),
      withSpring(1, { damping: 11 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { scale: scale.value }],
  }));

  const palette = VARIANT_PALETTE[toast.variant];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: palette.bg }, softShadow as any, style]}>
      <Pressable onPress={() => useToast.getState().dismiss(toast.id)} style={styles.inner}>
        <View style={[styles.dot, { backgroundColor: palette.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.fg }]}>{toast.title}</Text>
          {toast.subtitle ? <Text style={styles.sub}>{toast.subtitle}</Text> : null}
        </View>
        {toast.coin != null && (
          <View style={{ alignItems: 'flex-end' }}>
            <CoinBadge amount={toast.coin} size="md" sign />
            {toast.xp != null && toast.xp !== 0 && (
              <Text style={styles.xp}>+{toast.xp} XP</Text>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function ToastHost() {
  const toasts = useToast((s) => s.toasts);
  return (
    <View pointerEvents="box-none" style={styles.host}>
      {toasts.map((t) => (
        <ToastView key={t.id} toast={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 60,
    left: 14,
    right: 14,
    gap: spacing.sm,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: {
    fontSize: font.size.md,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.1,
  },
  sub: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  xp: {
    color: '#5D4A87',
    fontSize: font.size.xs,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
});
