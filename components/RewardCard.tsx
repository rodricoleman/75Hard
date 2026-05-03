import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
import { CoinBadge } from './CoinBadge';
import type { Reward } from '@/types';
import { formatBRL } from '@/lib/economy';
import { useRouter } from 'expo-router';

const TYPE_LABEL: Record<Reward['type'], string> = {
  consumable: 'consumível',
  oneoff: 'único',
  big: 'grande',
};

const TYPE_COLOR: Record<Reward['type'], { bg: string; fg: string }> = {
  consumable: { bg: colors.accentSoft, fg: '#2E6F58' },
  oneoff: { bg: colors.coinSoft, fg: '#9A6300' },
  big: { bg: colors.xpSoft, fg: '#5D4A87' },
};

export function RewardCard({
  reward,
  affordable,
  onRedeem,
}: {
  reward: Reward;
  affordable: boolean;
  onRedeem: () => void;
}) {
  const router = useRouter();
  const typePalette = TYPE_COLOR[reward.type];

  return (
    <View style={[styles.card, softShadowSm]}>
      <View style={styles.header}>
        <View style={styles.emojiBubble}>
          <Text style={styles.emoji}>{reward.emoji ?? '🎁'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.typePill, { backgroundColor: typePalette.bg }]}>
            <Text style={[styles.typeTxt, { color: typePalette.fg }]}>
              {TYPE_LABEL[reward.type]}
            </Text>
          </View>
          <Text style={styles.title}>{reward.title}</Text>
        </View>
        <Pressable onPress={() => router.push(`/reward/${reward.id}` as any)} hitSlop={8}>
          <Text style={styles.editTxt}>✎</Text>
        </Pressable>
      </View>

      {reward.description ? <Text style={styles.desc}>{reward.description}</Text> : null}

      <View style={styles.footer}>
        <View>
          <CoinBadge amount={reward.coin_cost} size="md" />
          {reward.real_price_brl != null && (
            <Text style={styles.price}>≈ {formatBRL(reward.real_price_brl)}</Text>
          )}
        </View>
        <Pressable
          onPress={onRedeem}
          disabled={!affordable}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: affordable ? colors.primary : colors.surfaceMuted,
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text
            style={[
              styles.btnText,
              { color: affordable ? '#3D3633' : colors.textDim },
            ]}
          >
            {affordable ? 'Resgatar ♡' : 'Falta coin'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  emojiBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  typeTxt: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
  },
  title: {
    color: colors.text,
    fontSize: font.size.lg,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -0.2,
  },
  editTxt: { color: colors.textDim, fontSize: 16, padding: 4 },
  desc: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: spacing.sm,
    fontFamily: fontFamily.body as any,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
  },
  price: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
  },
  btnText: {
    fontSize: font.size.sm,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
    letterSpacing: 0.2,
  },
});
