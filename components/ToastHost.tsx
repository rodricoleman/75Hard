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
import { font, radius, spacing } from '@/theme/tokens';

const VARIANT_COLOR: Record<ToastT['variant'], string> = {
  earn: colors.success,
  lose: colors.danger,
  level: colors.xp,
  info: colors.primary,
  error: colors.danger,
};

function ToastView({ toast }: { toast: ToastT }) {
  const ty = useSharedValue(-40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    ty.value = withSpring(0, { damping: 16, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withSpring(1, { damping: 12 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { scale: scale.value }],
  }));

  const accent = VARIANT_COLOR[toast.variant];

  return (
    <Animated.View style={[styles.toast, { borderColor: accent }, style]}>
      <Pressable onPress={() => useToast.getState().dismiss(toast.id)} style={styles.inner}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: accent }]}>{toast.title}</Text>
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
    top: Platform.OS === 'web' ? 16 : 56,
    left: 12,
    right: 12,
    gap: spacing.sm,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: font.size.md, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  xp: { color: colors.xp, fontSize: font.size.xs, fontWeight: '700', marginTop: 2 },
});
