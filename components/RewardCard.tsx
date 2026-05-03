import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, radius, spacing } from '@/theme/tokens';
import { CoinBadge } from './CoinBadge';
import type { Reward } from '@/types';
import { formatBRL } from '@/lib/economy';
import { useRouter } from 'expo-router';

const TYPE_LABEL: Record<Reward['type'], string> = {
  consumable: 'CONSUMÍVEL',
  oneoff: 'ÚNICO',
  big: 'GRANDE',
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
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{reward.emoji ?? '🎁'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.type}>{TYPE_LABEL[reward.type]}</Text>
          <Text style={styles.title}>{reward.title}</Text>
        </View>
        <Pressable onPress={() => router.push(`/reward/${reward.id}` as any)} hitSlop={8}>
          <Text style={styles.editTxt}>editar</Text>
        </Pressable>
      </View>

      {reward.description ? <Text style={styles.desc}>{reward.description}</Text> : null}

      <View style={styles.footer}>
        <View>
          <CoinBadge amount={reward.coin_cost} size="md" />
          {reward.real_price_brl != null && (
            <Text style={styles.price}>{formatBRL(reward.real_price_brl)}</Text>
          )}
        </View>
        <Pressable
          onPress={onRedeem}
          disabled={!affordable}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: affordable ? colors.primary : colors.surfaceAlt,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.btnText,
              { color: affordable ? '#0B0D10' : colors.textDim },
            ]}
          >
            {affordable ? 'Resgatar' : 'Falta coin'}
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
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  emoji: { fontSize: 32 },
  type: { color: colors.textDim, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: font.weight.bold },
  editTxt: { color: colors.textMuted, fontSize: font.size.xs },
  desc: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
  },
  price: { color: colors.textDim, fontSize: font.size.xs, marginTop: 2 },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnText: { fontSize: font.size.md, fontWeight: font.weight.bold },
});
