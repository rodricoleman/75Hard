import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { CoinBadge } from '@/components/CoinBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { RewardCard } from '@/components/RewardCard';
import { Button } from '@/components/Button';
import { useRewards } from '@/store/useRewards';
import { useProfile } from '@/store/useProfile';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';
import * as haptic from '@/lib/haptics';

function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Resgatar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function Rewards() {
  const router = useRouter();
  const rewards = useRewards((s) => s.rewards);
  const redeem = useRewards((s) => s.redeem);
  const profile = useProfile((s) => s.profile);
  const [busyId, setBusyId] = useState<string | null>(null);

  const balance = profile?.coin_balance ?? 0;

  const handleRedeem = async (id: string, title: string, cost: number) => {
    const ok = await confirm(
      `Resgatar "${title}"?`,
      `Vai debitar ${cost} coin do saldo. Você tem permissão pra gastar a grana real correspondente.`,
    );
    if (!ok) return;
    setBusyId(id);
    const { error } = await redeem(id);
    setBusyId(null);
    if (error) {
      Alert.alert('Erro', error);
    } else {
      haptic.success();
    }
  };

  const groups = {
    consumable: rewards.filter((r) => r.type === 'consumable'),
    oneoff: rewards.filter((r) => r.type === 'oneoff'),
    big: rewards.filter((r) => r.type === 'big'),
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Loja ♡</Text>
          <Text style={styles.sub}>Gaste coin no que importa.</Text>
        </View>
        <View style={[styles.balanceBubble, softShadowSm]}>
          <Text style={styles.balanceLabel}>SALDO</Text>
          <CoinBadge amount={balance} size="md" />
        </View>
      </View>

      {rewards.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="Sem recompensas"
          body="Cadastra o que você quer comprar com coin. Pequenos prazeres, médios, grandes."
          actionLabel="Criar recompensa"
          onAction={() => router.push('/reward/new' as any)}
        />
      ) : (
        <>
          {groups.consumable.length > 0 && (
            <>
              <SectionHeader
                title="Consumíveis"
                emoji="✿"
                actionLabel="+ novo"
                onAction={() => router.push('/reward/new' as any)}
              />
              {groups.consumable.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          {groups.oneoff.length > 0 && (
            <>
              <SectionHeader title="Únicos" emoji="✦" />
              {groups.oneoff.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          {groups.big.length > 0 && (
            <>
              <SectionHeader title="Grandes" emoji="♡" />
              {groups.big.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          <Button
            label="+ nova recompensa"
            variant="ghost"
            onPress={() => router.push('/reward/new' as any)}
            style={{ marginTop: spacing.lg }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
  },
  sub: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    marginTop: spacing.xs,
    fontFamily: fontFamily.body as any,
  },
  balanceBubble: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: fontFamily.body as any,
  },
});
